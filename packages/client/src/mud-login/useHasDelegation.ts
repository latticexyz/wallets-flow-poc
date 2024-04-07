import { useStore } from "./useStore";
import { useAccount, usePublicClient } from "wagmi";
import { useLoginConfig } from "./Context";
import { useQuery } from "@tanstack/react-query";
import { useAppAccount } from "./useAppAccount";
import { useAppSigner } from "./useAppSigner";
import { getRecord } from "./getRecord";
import { Address } from "abitype";
import { PublicClient } from "viem";
import { unlimitedDelegationControlId } from "./common";
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
    blockTag: "pending",
  });
  return record.delegationControlId === unlimitedDelegationControlId;
}

export function useHasDelegation(): boolean | undefined {
  const { chainId, worldAddress } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });
  const userAccount = useAccount();
  const [appSignerAccount] = useAppSigner();
  const appAccount = useAppAccount({ publicClient, appSignerAccount });
  const delegationTransaction = useStore((state) => state.delegationTransaction);

  const userAccountAddress = userAccount.address;
  const appAccountAddress = appAccount.data?.address;

  const queryKey = [
    "mud:hasDelegation",
    publicClient?.chain.id,
    worldAddress,
    userAccountAddress,
    appAccountAddress,
    // TODO: clear this cache key during delegation rather than adding a tx to store
    delegationTransaction,
  ] as const;

  const result = useQuery(
    publicClient && worldAddress && userAccountAddress && appAccountAddress
      ? {
          queryKey,
          queryFn: () =>
            hasDelegation({
              publicClient,
              worldAddress,
              userAccountAddress,
              appAccountAddress,
            }),
          staleTime: 1000 * 60 * 5,
        }
      : {
          queryKey,
          enabled: false,
        },
  );

  return result.data;
}
