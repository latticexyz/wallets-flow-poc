import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";

export type State = {
  dialogOpen: boolean;
  // TODO: replace with real allowance check
  mockGasAllowance: bigint | null;
  hasDelegation: boolean | null;
};

const initialState = {
  dialogOpen: false,
  mockGasAllowance: null,
  hasDelegation: null,
} as const satisfies State;

export const store = createStore(subscribeWithSelector<State>(() => initialState));
