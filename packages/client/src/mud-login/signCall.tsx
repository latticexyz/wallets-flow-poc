import { Account, Address, Chain, Hex, Transport, WalletClient } from "viem";
import { signTypedData } from "viem/actions";
import { callWithSignatureTypes } from "@latticexyz/world/internal";

// TODO: turn args into object
export async function signCall(
  chainId: number,
  worldAddress: Address,
  walletClient: WalletClient<Transport, Chain, Account>,
  systemId: Hex,
  callData: Hex,
  nonce: bigint,
) {
  return await signTypedData(walletClient, {
    account: walletClient.account,
    domain: {
      chainId,
      verifyingContract: worldAddress,
    },
    types: callWithSignatureTypes,
    primaryType: "Call",
    message: {
      signer: walletClient.account.address,
      systemId,
      callData,
      nonce,
    },
  });
}
