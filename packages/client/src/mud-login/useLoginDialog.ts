import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand/react";
import { createStore } from "zustand/vanilla";

const store = createStore(() => ({ dialogOpen: false }));

// TODO: split this out into multiple hooks
export type UseLoginDialogResult = {
  // TODO: figure out how to get this to be not undefined?
  readonly openConnectModal: (() => void) | undefined;
  readonly loginDialogOpen: boolean;
  readonly openLoginDialog: () => void;
  readonly closeLoginDialog: () => void;
  readonly toggleLoginDialog: (open: boolean) => void;
};

export function useLoginDialog(): UseLoginDialogResult {
  const { openConnectModal } = useConnectModal();
  const loginDialogOpen = useStore(store, (state) => state.dialogOpen);

  const openLoginDialog = useCallback(() => {
    store.setState({ dialogOpen: true });
  }, []);

  const closeLoginDialog = useCallback(() => {
    store.setState({ dialogOpen: false });
  }, []);

  const toggleLoginDialog = useCallback((open: boolean) => {
    store.setState({ dialogOpen: open });
  }, []);

  return useMemo(
    () => ({
      openConnectModal,
      loginDialogOpen,
      openLoginDialog,
      closeLoginDialog,
      toggleLoginDialog,
    }),
    [closeLoginDialog, loginDialogOpen, openConnectModal, openLoginDialog, toggleLoginDialog],
  );
}
