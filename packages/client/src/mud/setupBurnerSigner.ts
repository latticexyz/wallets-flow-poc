import { Hex } from "viem";
import { createWalletClient } from "viem";
import { getNetworkConfig } from "./getNetworkConfig";
import { createBurnerAccount } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { getClientOptions } from "./getClientOptions";
import { SetupNetworkResult } from "./setupNetwork";

export async function setupBurnerSigner(network: SetupNetworkResult) {
  const networkConfig = await getNetworkConfig();
  const clientOptions = getClientOptions(networkConfig);

  // TODO: derive burner signer here
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
    .extend(writeObserver({ onWrite: (write) => network.write$.next(write) }));

  return burnerWalletClient;
}
