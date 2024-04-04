import { useStore } from "./useStore";
import { useAccount, usePublicClient } from "wagmi";
import { useLoginConfig } from "./Context";
import { hasDelegation as checkHasDelegation } from "./hasDelegation";
import { useQuery } from "@tanstack/react-query";
import { useAppAccount } from "./useAppAccount";
import { useAppSigner } from "./useAppSigner";

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
    delegationTransaction,
  ] as const;

  const result = useQuery(
    publicClient && worldAddress && userAccountAddress && appAccountAddress
      ? {
          queryKey,
          queryFn: () =>
            checkHasDelegation({
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
