import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { Hex } from "viem";

export type State = {
  dialogOpen: boolean;
  // TODO: replace with real allowance check
  mockGasAllowance: bigint | null;
  delegationTransaction: Hex | null;
};

const initialState = {
  dialogOpen: false,
  mockGasAllowance: null,
  delegationTransaction: null,
} as const satisfies State;

export const store = createStore(subscribeWithSelector<State>(() => initialState));
