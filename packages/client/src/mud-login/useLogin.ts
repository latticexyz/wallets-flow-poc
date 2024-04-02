import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export const loginRequirements = ["connected-wallet"] as const;

export type LoginRequirement = (typeof loginRequirements)[number];

export type UseLoginResult = {
  readonly requirements: readonly LoginRequirement[];
  // TODO: figure out how to get this to be not undefined?
  readonly openConnectModal: (() => void) | undefined;
};

export function useLogin(): UseLoginResult {
  const { openConnectModal } = useConnectModal();
  const { status: accountStatus } = useAccount();
  console.log("accountStatus", accountStatus);

  const requirements = loginRequirements.filter((requirement) => {
    if (requirement === "connected-wallet") {
      return accountStatus !== "connected";
    }
    return true;
  });

  console.log("requirements", requirements);

  return {
    requirements,
    openConnectModal,
  };
}
