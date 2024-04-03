import { Address, PublicClient } from "viem";
import { unlimitedDelegationControlId } from "./common";
import { getRecord } from "./getRecord";
import worldConfig from "@latticexyz/world/mud.config";

export type HasDelegationOptions = {
  publicClient: PublicClient;
  worldAddress: Address;
  userAccountAddress: Address;
  appAccountAddress: Address;
};

export async function hasDelegation({
  publicClient,
  worldAddress,
  userAccountAddress,
  appAccountAddress,
}: HasDelegationOptions): Promise<boolean> {
  const record = await getRecord(publicClient, {
    storeAddress: worldAddress,
    table: worldConfig.tables.world__UserDelegationControl,
    key: {
      delegator: userAccountAddress,
      delegatee: appAccountAddress,
    },
  });
  return record.delegationControlId === unlimitedDelegationControlId;
}
