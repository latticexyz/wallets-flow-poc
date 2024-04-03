import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { store } from "./store";
import { useStore } from "./useStore";
import { useAppAccountClient } from "./useAppAccountClient";
import { LoginRequirement, loginRequirements } from "./common";

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
  const appSignerAccount = useStore((state) => state.appSignerAccount);
  const gasAllowance = useStore((state) => state.mockGasAllowance);
  const appAccountClient = useAppAccountClient();

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
      // TODO
      accountDelegation: () => appAccountClient != null,
    } as const satisfies Record<LoginRequirement, () => boolean>;

    return loginRequirements.filter((requirement) => !satisfiesRequirement[requirement]());
  }, [accountStatus, appAccountClient, appSignerAccount, gasAllowance]);

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
