import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { PrivateKeyAccount, WalletClient } from "viem";

export type State = {
  dialogOpen: boolean;
  appSignerAccount: PrivateKeyAccount | null;
  // TODO: deprecate/replace? calculate on the fly?
  walletClient: WalletClient | null;
  appSignerWalletClient: WalletClient | null;
  smartAccountWalletClient: WalletClient | null;
  // TODO: replace with real allowance check
  mockGasAllowance: bigint | null;
  hasDelegation: boolean | null;
};

const initialState = {
  dialogOpen: false,
  appSignerAccount: null,
  walletClient: null,
  appSignerWalletClient: null,
  smartAccountWalletClient: null,
  mockGasAllowance: null,
  hasDelegation: null,
} as const satisfies State;

export const store = createStore(subscribeWithSelector<State>(() => initialState));
