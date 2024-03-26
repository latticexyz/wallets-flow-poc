import { create, UseBoundStore, StoreApi } from "zustand";
import { SetupNetworkResult } from "./setupNetwork";
import { WalletClient } from "viem";
import { SystemCalls } from "./createSystemCalls";

type SetState = (state: MUDState) => void;

export type MUDState =
  | {
      state: "loading";
    }
  | {
      state: "read";
      network: SetupNetworkResult;
    }
  | {
      state: "write";
      network: SetupNetworkResult;
      walletClient: WalletClient;
      systemCalls: SystemCalls;
      worldContract: any;
    };

export const useMUDStore = create<MUDState & { set: SetState }>((set) => ({
  state: "loading",
  set,
}));

export function useMUD(): MUDState & { state: "read" | "write" };
export function useMUD<T>(
  selector?: (
    state: MUDState & {
      set: SetState;
    },
  ) => T,
) {
  const status = useMUDStore((store) => store.state);
  if (status === "loading") {
    throw new Error("Accessing MUD context before loading is done. Are you using MUDProvider?");
  }

  return useMUDStore(
    selector as (
      state: MUDState & {
        set: SetState;
      },
    ) => T,
  );
}
