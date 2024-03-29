import { WalletClient, Transport, Chain, Account } from "viem";

export const signAppSignerMessage = async (walletClient: WalletClient<Transport, Chain, Account>) => {
  const signature = await walletClient.signMessage({
    account: walletClient.account,
    // TODO: make signer based on website URL
    message: "Create app-signer",
  });

  return signature;
};
