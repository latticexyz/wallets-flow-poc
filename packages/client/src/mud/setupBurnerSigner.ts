import { Hex } from "viem";
import { Subject } from "rxjs";
import { createWalletClient } from "viem";
import { getNetworkConfig } from "./getNetworkConfig";
import { createBurnerAccount, ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { getClientOptions } from "./getClientOptions";

export async function setupBurnerSigner() {
  const networkConfig = await getNetworkConfig();
  const clientOptions = getClientOptions(networkConfig);

  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

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
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  return burnerWalletClient;
}
