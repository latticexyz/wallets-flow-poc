import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { Hex } from "viem";

export type State = {
  dialogOpen: boolean;
  delegationTransaction: Hex | null;
};

const initialState = {
  dialogOpen: false,
  delegationTransaction: null,
} as const satisfies State;

export const store = createStore(subscribeWithSelector<State>(() => initialState));
