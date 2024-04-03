import { resourceToHex } from "@latticexyz/common";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { Address } from "viem";

export const entryPoint = ENTRYPOINT_ADDRESS_V07;

export type MUDLoginConfig = {
  chainId: number;
  worldAddress: Address;
};

export const loginRequirements = ["connectedWallet", "appSigner", "gasAllowance", "accountDelegation"] as const;

export type LoginRequirement = (typeof loginRequirements)[number];

export const unlimitedDelegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });
