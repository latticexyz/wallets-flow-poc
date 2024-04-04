import { usePromise } from "@latticexyz/react";
import { useMemo } from "react";
import { useStore } from "./useStore";
import { useAccount, usePublicClient } from "wagmi";
import { useAppAccountClient } from "./useAppAccountClient";
import { useLoginConfig } from "./Context";
import { hasDelegation as checkHasDelegation } from "./hasDelegation";

export function useHasDelegation(): boolean | null {
  const { chainId, worldAddress } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });
  const delegationTransaction = useStore((state) => state.delegationTransaction);
  const userAccount = useAccount();
  const appAccountClient = useAppAccountClient();

  const hasDelegationResult = usePromise(
    useMemo(async () => {
      console.log("checking if has delegation");

      // this is here to satisfy linter so this lands in useMemo dependency array
      // it's used to retrigger this check when the transaction changes
      delegationTransaction;

      if (!publicClient) {
        console.log("no public client");
        return false;
      }
      if (!userAccount.address) {
        console.log("no user account");
        return false;
      }
      if (!appAccountClient) {
        console.log("no app account");
        return false;
      }

      const hasDelegation = await checkHasDelegation({
        publicClient,
        worldAddress,
        userAccountAddress: userAccount.address,
        appAccountAddress: appAccountClient.account.address,
      });

      console.log("has delegation?", hasDelegation);

      return hasDelegation;
    }, [appAccountClient, delegationTransaction, publicClient, userAccount.address, worldAddress]),
  );

  return hasDelegationResult.status === "fulfilled" ? hasDelegationResult.value : null;
}
