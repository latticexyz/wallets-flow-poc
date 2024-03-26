import { create } from "zustand";
import { SetupNetworkResult } from "./setupNetwork";
import { WalletClient } from "viem";
import { SystemCalls } from "./createSystemCalls";

interface MUDState {
  network: SetupNetworkResult | null;
  setNetwork: (network: SetupNetworkResult) => void;

  walletClient: WalletClient | null;
  setWalletClient: (walletClient: WalletClient) => void;

  systemCalls: SystemCalls | null;
  setSystemCalls: (systemCalls: SystemCalls) => void;

  worldContract: any;
  setWorldContract: (worldContract: any) => void;
}

export const useMUDStore = create<MUDState>((set) => ({
  network: null,
  setNetwork: (network: SetupNetworkResult) => set({ network }),

  walletClient: null,
  setWalletClient: (walletClient: WalletClient) => set({ walletClient }),

  systemCalls: null,
  setSystemCalls: (systemCalls) => set({ systemCalls }),

  worldContract: null,
  setWorldContract: (worldContract) => set({ worldContract }),
}));
