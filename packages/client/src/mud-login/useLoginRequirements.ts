import { useAccount } from "wagmi";
import { useStore } from "./useStore";
import { LoginRequirement, loginRequirements } from "./common";
import { useAppSigner } from "./useAppSigner";
import { useHasDelegation } from "./useHasDelegation";
import { useMemo } from "react";

export type UseLoginRequirementsResult = {
  readonly requirement: LoginRequirement | null;
  readonly requirements: readonly LoginRequirement[];
};

export function useLoginRequirements(): UseLoginRequirementsResult {
  const { status: accountStatus } = useAccount();

  const [appSignerAccount] = useAppSigner();
  const gasAllowance = useStore((state) => state.mockGasAllowance);
  const hasDelegation = useHasDelegation();

  return useMemo(() => {
    const satisfiesRequirement = {
      connectedWallet: () => accountStatus === "connected",
      appSigner: () => appSignerAccount != null,
      gasAllowance: () => gasAllowance != null && gasAllowance > 0n,
      accountDelegation: () => hasDelegation === true,
    } as const satisfies Record<LoginRequirement, () => boolean>;

    const requirements = loginRequirements.filter((requirement) => !satisfiesRequirement[requirement]());

    return {
      requirement: requirements.at(0) ?? null,
      requirements,
    };
  }, [accountStatus, appSignerAccount, gasAllowance, hasDelegation]);
}
