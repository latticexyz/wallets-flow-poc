import { Account, Chain, Hex, Transport, WalletClient } from "viem";
import { signMessage } from "viem/actions";

export async function signAppSignerMessage(walletClient: WalletClient<Transport, Chain, Account>): Promise<Hex> {
  const signature = await signMessage(walletClient, {
    account: walletClient.account,
    // TODO: improve message, include location.origin
    message: "Create app-signer",
  });

  return signature;
}
