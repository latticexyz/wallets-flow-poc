import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";

export type State = {
  dialogOpen: boolean;
};

const initialState = {
  dialogOpen: false,
} as const satisfies State;

export const store = createStore(subscribeWithSelector<State>(() => initialState));
