import { create } from "zustand";
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
