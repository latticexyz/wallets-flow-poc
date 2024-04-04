import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { store } from "./store";
import { useStore } from "./useStore";
import { LoginRequirement, loginRequirements } from "./common";
import { useAppSigner } from "./useAppSigner";
import { useHasDelegation } from "./useHasDelegation";

// TODO: split this out into multiple hooks
export type UseLoginResult = {
  readonly currentRequirement: LoginRequirement | null;
  readonly requirements: readonly LoginRequirement[];
  // TODO: figure out how to get this to be not undefined?
  readonly openConnectModal: (() => void) | undefined;
  readonly loginDialogOpen: boolean;
  readonly openLoginDialog: () => void;
  readonly closeLoginDialog: () => void;
  readonly toggleLoginDialog: (open: boolean) => void;
};

export function useLogin(): UseLoginResult {
  const { openConnectModal } = useConnectModal();
  const { status: accountStatus } = useAccount();

  const loginDialogOpen = useStore((state) => state.dialogOpen);
  const [appSignerAccount] = useAppSigner();
  const gasAllowance = useStore((state) => state.mockGasAllowance);
  const hasDelegation = useHasDelegation();

  const openLoginDialog = useCallback(() => {
    store.setState({ dialogOpen: true });
  }, []);

  const closeLoginDialog = useCallback(() => {
    store.setState({ dialogOpen: false });
  }, []);

  const toggleLoginDialog = useCallback((open: boolean) => {
    store.setState({ dialogOpen: open });
  }, []);

  const requirements = useMemo(() => {
    const satisfiesRequirement = {
      connectedWallet: () => accountStatus === "connected",
      appSigner: () => appSignerAccount != null,
      gasAllowance: () => gasAllowance != null && gasAllowance > 0n,
      accountDelegation: () => hasDelegation === true,
    } as const satisfies Record<LoginRequirement, () => boolean>;

    return loginRequirements.filter((requirement) => !satisfiesRequirement[requirement]());
  }, [accountStatus, appSignerAccount, gasAllowance, hasDelegation]);

  console.log("requirements", requirements);

  return useMemo(
    () => ({
      currentRequirement: requirements.at(0) ?? null,
      requirements,
      openConnectModal,
      loginDialogOpen,
      openLoginDialog,
      closeLoginDialog,
      toggleLoginDialog,
    }),
    [closeLoginDialog, loginDialogOpen, openConnectModal, openLoginDialog, requirements, toggleLoginDialog],
  );
}
