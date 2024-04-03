import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { Address } from "viem";

export const entryPoint = ENTRYPOINT_ADDRESS_V07;

export type MUDLoginConfig = {
  worldAddress: Address;
};

export const loginRequirements = ["connectedWallet", "appSigner", "gasAllowance", "accountDelegation"] as const;

export type LoginRequirement = (typeof loginRequirements)[number];
