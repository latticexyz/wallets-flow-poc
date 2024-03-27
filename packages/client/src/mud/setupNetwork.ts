/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import { createPublicClient, http, Hex, PrivateKeyAccount, parseEther, Address, Chain, createWalletClient } from "viem";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { getNetworkConfig } from "./getNetworkConfig";
import { createBurnerAccount, ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
// import { callFrom } from "@latticexyz/world/internal";
import { Subject } from "rxjs";
import { ENTRYPOINT_ADDRESS_V07, createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";
import { mnemonicToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { getClientOptions } from "./getClientOptions";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  /*
   * Create a viem public (read only) client
   * (https://viem.sh/docs/clients/public.html)
   */
  const clientOptions = getClientOptions(networkConfig);
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
    .extend(transactionQueue(publicClient))
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));
  // .extend(
  //   callFrom({
  //     worldAddress: networkConfig.worldAddress,
  //     // TODO: how can we get access to the main wallet here?
  //     // Maybe setting up the `wallet client` should be somehow separate from the initial network setup,
  //     // since it depends on the main user wallet being connected.
  //     // Also, what if the user changes their main wallet? How do we update the burner wallet?
  //     delegatorAddress: "0x4f4ddafbc93cf8d11a253f21ddbcf836139efdec",
  //     publicClient,
  //   }),
  // );

  ////////////////////
  // JUST IN DEV
  async function seedAccount(to: Address, chain: Chain) {
    const account = mnemonicToAccount("test test test test test test test test test test test junk");

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http("http://localhost:8545"),
    });

    await walletClient.sendTransaction({
      to,
      value: parseEther("5"),
    });
  }

  await seedAccount(appSmartAccount.address, foundry);
  ///////////////////

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
    write$,
    tables,
    useStore,
    publicClient,
    walletClient: appSmartAccountClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
  };
}
