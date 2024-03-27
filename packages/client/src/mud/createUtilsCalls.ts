import { Hex, WalletClient, Transport, Chain, Account } from "viem";
import { NetworkConfig } from "./getNetworkConfig";
import { resourceToHex } from "@latticexyz/common";
import { delegationWithSignatureTypes } from "@latticexyz/world/internal";
import modulesConfig from "@latticexyz/world-modules/mud.config";
import { storeToV1 } from "@latticexyz/store/config/v2";
import { resolveConfig } from "@latticexyz/store/internal";
import { SetupNetworkResult } from "./setupNetwork";

export type UtilsCalls = ReturnType<typeof createUtilsCalls>;

const resolvedConfig = resolveConfig(storeToV1(modulesConfig));

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

export function createUtilsCalls(network: SetupNetworkResult, networkConfig: NetworkConfig, worldContract: any) {
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
    const nonceRecord = network.useStore
      .getState()
      .getRecord(resolvedConfig.tables.UserDelegationNonces, { delegator: walletClient.account.address });

    const nonce = nonceRecord ? nonceRecord.value.nonce : 0n;

    return registerUnlimitedDelegationWithSignature(walletClient, delegatee, nonce);
  };

  return {
    signDelegationMessage,
    registerDelegationWithSignature,
    registerUnlimitedDelegationWithSignature,
    registerUnlimitedDelegationWithSignatureNow,
  };
}
