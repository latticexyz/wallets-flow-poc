import { WalletClient } from "viem";
import config from "contracts/mud.config";
import { SetupNetworkResult } from "./setupNetwork";

export async function setupDevTools(network: SetupNetworkResult, walletClient: WalletClient, worldContract: any) {
  // https://vitejs.dev/guide/env-and-mode.html
  if (import.meta.env.DEV) {
    const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
    mountDevTools({
      config,
      publicClient: network.publicClient,
      walletClient,
      latestBlock$: network.latestBlock$,
      storedBlockLogs$: network.storedBlockLogs$,
      worldAddress: worldContract.address,
      worldAbi: worldContract.abi,
      write$: network.write$,
      useStore: network.useStore,
    });
  }
}
