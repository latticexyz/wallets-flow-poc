/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import { createPublicClient, fallback, webSocket, http, Hex, ClientConfig, getContract, PrivateKeyAccount } from "viem";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { getNetworkConfig } from "./getNetworkConfig";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createBurnerAccount, transportObserver, ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { callFrom } from "@latticexyz/world/internal";
import { Subject, share } from "rxjs";
import { ENTRYPOINT_ADDRESS_V07, createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";
import { MOCK_PAYMASTER_ADDRESS } from "../../../account-abstraction/src/deployPaymaster";

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  /*
   * Create a viem public (read only) client
   * (https://viem.sh/docs/clients/public.html)
   */
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  const pimlicoBundlerClient = createPimlicoBundlerClient({
    chain: clientOptions.chain,
    transport: http("http://127.0.0.1:4337"),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  const appSigner = createBurnerAccount(networkConfig.privateKey as Hex) as PrivateKeyAccount;

  const appSmartAccount = await signerToSimpleSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    signer: appSigner,
  });

  const appSmartAccountClient = createSmartAccountClient({
    chain: clientOptions.chain,
    bundlerTransport: http("http://127.0.0.1:4337"),
    middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const gasEstimates = await pimlicoBundlerClient.estimateUserOperationGas({
          userOperation: {
            ...userOperation,
            paymaster: MOCK_PAYMASTER_ADDRESS,
            paymasterData: "0x",
          },
        });

        return {
          paymasterData: "0x",
          paymaster: MOCK_PAYMASTER_ADDRESS,
          ...gasEstimates,
        };
      },
      gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
    },
    account: appSmartAccount,
  })
    .extend(() => ({
      getTransactionCount: (args) => {
        console.log("getTransactionCount, ", args);
        return getTransactionCount(publicClient, args);
      },
      call: (args) => call(publicClient, args),
    }))
    // .extend(transactionQueue(publicClient))
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }))
    .extend(
      callFrom({
        worldAddress: networkConfig.worldAddress,
        // TODO: how can we get access to the main wallet here?
        // Maybe setting up the `wallet client` should be somehow separate from the initial network setup,
        // since it depends on the main user wallet being connected.
        // Also, what if the user changes their main wallet? How do we update the burner wallet?
        delegatorAddress: "0x4f4ddafbc93cf8d11a253f21ddbcf836139efdec",
        publicClient,
      }),
    );

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: appSmartAccountClient },
  });

  /*
   * Sync on-chain state into RECS and keeps our client in sync.
   * Uses the MUD indexer if available, otherwise falls back
   * to the viem publicClient to make RPC calls to fetch MUD
   * events from the chain.
   */
  const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  return {
    tables,
    useStore,
    publicClient,
    walletClient: appSmartAccountClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
  };
}
