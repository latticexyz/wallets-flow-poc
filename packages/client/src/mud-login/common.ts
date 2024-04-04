import { resourceToHex } from "@latticexyz/common";
import { ENTRYPOINT_ADDRESS_V07, SmartAccountClient } from "permissionless";
import { SmartAccount } from "permissionless/accounts";
import { Address, Chain, Transport } from "viem";

export const accountAbstractionEntryPoint = ENTRYPOINT_ADDRESS_V07;
export type AppAccount = SmartAccount<typeof accountAbstractionEntryPoint>;
export type AppAccountClient = SmartAccountClient<typeof accountAbstractionEntryPoint, Transport, Chain, AppAccount>;

export const smartAccountFactory = "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985";

export type MUDLoginConfig = {
  chainId: number;
  worldAddress: Address;
  gasTankAddress: Address;
};

export const loginRequirements = ["connectedWallet", "appSigner", "gasAllowance", "accountDelegation"] as const;

export type LoginRequirement = (typeof loginRequirements)[number];

export const unlimitedDelegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });
