import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { WalletClient } from "viem";

export type State = {
  dialogOpen: boolean;
  walletClient: WalletClient | null;
  appSignerWalletClient: WalletClient | null;
  smartAccountWalletClient: WalletClient | null;
};

const initialState = {
  dialogOpen: false,
  walletClient: null,
  appSignerWalletClient: null,
  smartAccountWalletClient: null,
} satisfies State;

export const store = createStore(subscribeWithSelector<State>(() => initialState));
