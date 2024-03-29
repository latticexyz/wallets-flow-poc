import { create } from "zustand";
import { SetupNetworkResult } from "./setupNetwork";
import { WalletClient } from "viem";
import { SystemCalls } from "./createSystemCalls";
import { UtilsCalls } from "./createUtilsCalls";

type SetState = (state: MUDState) => void;

export type MUDState = {
  status: "loading" | "read" | "write";
  network: SetupNetworkResult | null;
  walletClient: WalletClient | null;
  appSignerWalletClient: WalletClient | null;
  smartAccountWalletClient: WalletClient | null;
  systemCalls: SystemCalls | null;
  utilsCalls: UtilsCalls | null;
  worldContract: any;
};

export const useMUDStore = create<MUDState & { set: SetState }>((set) => ({
  status: "loading",
  set,
}));

export function useMUD(): MUDState & { status: "read" | "write" };
export function useMUD<T>(
  selector?: (
    state: MUDState & {
      set: SetState;
    },
  ) => T,
) {
  const status = useMUDStore((store) => store.status);
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
