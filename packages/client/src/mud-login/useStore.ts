import { useStore as zustand_useStore } from "zustand";
import { State, store } from "./store";

export function useStore<slice>(selector: (state: State) => slice): slice {
  return zustand_useStore(store, selector);
}
