import { Hex } from "viem";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { ContractWrite } from "@latticexyz/common";
import { Subject } from "rxjs";
import mudConfig from "contracts/mud.config";
import { networkConfig, publicClient } from "../common";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

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
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
  };
}
