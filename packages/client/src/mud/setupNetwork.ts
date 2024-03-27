/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import {
  createPublicClient,
  fallback,
  webSocket,
  http,
  createWalletClient,
  Hex,
  parseEther,
  ClientConfig,
  getContract,
  WalletClient,
  Transport,
  Chain,
  Account,
} from "viem";
import { createFaucetService } from "@latticexyz/services/faucet";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { getNetworkConfig } from "./getNetworkConfig";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createBurnerAccount, transportObserver, ContractWrite, resourceToHex } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { delegationWithSignatureTypes } from "@latticexyz/world/internal";
import { Subject, share } from "rxjs";

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";
import modulesConfig from "@latticexyz/world-modules/mud.config";
import { storeToV1 } from "@latticexyz/store/config/v2";
import { resolveConfig } from "@latticexyz/store/internal";

const resolvedConfig = resolveConfig(storeToV1(modulesConfig));

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

const DelegationAbi = [
  {
    type: "function",
    name: "registerDelegationWithSignature",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address",
      },
      {
        name: "delegationControlId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "initCallData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "delegator",
        type: "address",
        internalType: "address",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

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

  /*
   * Create a temporary wallet and a viem client for it
   * (see https://viem.sh/docs/clients/wallet.html).
   */
  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  })
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: burnerWalletClient },
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

  /*
   * If there is a faucet, request (test) ETH if you have
   * less than 1 ETH. Repeat every 20 seconds to ensure you don't
   * run out.
   */
  if (networkConfig.faucetServiceUrl) {
    const address = burnerAccount.address;
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance < parseEther("1");
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");
        // Double drip
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  }

  const signDelegationMessage = (
    walletClient: WalletClient<Transport, Chain, Account>,
    delegatee: Hex,
    delegationControlId: Hex,
    initCallData: Hex,
    nonce: bigint,
  ) => {
    return walletClient.signTypedData({
      domain: {
        chainId: networkConfig.chain.id,
        verifyingContract: worldContract.address,
      },
      types: delegationWithSignatureTypes,
      primaryType: "Delegation",
      message: {
        delegatee,
        delegationControlId: delegationControlId,
        initCallData,
        delegator: walletClient.account.address,
        nonce,
      },
    });
  };

  const registerDelegationWithSignature = async (
    walletClient: WalletClient<Transport, Chain, Account>,
    delegatee: Hex,
    delegationControlId: Hex,
    initCallData: Hex,
    nonce: bigint,
  ) => {
    const signature = await signDelegationMessage(walletClient, delegatee, delegationControlId, initCallData, nonce);

    return walletClient.writeContract({
      address: worldContract.address,
      abi: DelegationAbi,
      functionName: "registerDelegationWithSignature",
      args: [delegatee, delegationControlId, initCallData, walletClient.account.address, signature],
    });
  };

  const registerUnlimitedDelegationWithSignature = (
    walletClient: WalletClient<Transport, Chain, Account>,
    delegatee: Hex,
    nonce: bigint,
  ) => {
    const delegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });
    const initCallData = "0x";

    return registerDelegationWithSignature(walletClient, delegatee, delegationControlId, initCallData, nonce);
  };

  // "Now" because the nonce is automatically handled
  const registerUnlimitedDelegationWithSignatureNow = (
    walletClient: WalletClient<Transport, Chain, Account>,
    delegatee: Hex,
  ) => {
    const delegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });
    const initCallData = "0x";
    const nonceRecord = useStore
      .getState()
      .getRecord(resolvedConfig.tables.UserDelegationNonces, { delegator: walletClient.account.address });

    const nonce = nonceRecord ? nonceRecord.value.nonce : 0n;

    return registerDelegationWithSignature(walletClient, delegatee, delegationControlId, initCallData, nonce);
  };

  return {
    tables,
    useStore,
    publicClient,
    walletClient: burnerWalletClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
    signDelegationMessage,
    registerDelegationWithSignature,
    registerUnlimitedDelegationWithSignature,
    registerUnlimitedDelegationWithSignatureNow,
  };
}
