import { create } from "zustand";

export const useMUDStore = create((set) => ({
  walletClient: null,
  setWalletClient: (walletClient) => set({ walletClient }),

  systemCalls: null,
  setSystemCalls: (systemCalls) => set({ systemCalls }),

  worldContract: null,
  setWorldContract: (worldContract) => set({ worldContract }),
}));
