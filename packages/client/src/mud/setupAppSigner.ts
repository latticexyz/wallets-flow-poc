import { Hex, hashMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export async function setupAppSigner(signedMessage: Hex) {
  const appSignerWalletClient = privateKeyToAccount(hashMessage(signedMessage));
  return appSignerWalletClient;
}
