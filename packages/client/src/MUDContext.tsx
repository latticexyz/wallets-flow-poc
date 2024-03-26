import { createContext, ReactNode, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Hex, getContract } from "viem";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createSystemCalls } from "./mud/createSystemCalls";
import { setupBurnerSigner } from "./mud/setupBurnerSigner";
import { setupNetwork, SetupNetworkResult } from "./mud/setupNetwork";
import { getNetworkConfig } from "./mud/getNetworkConfig";
import { useMUDStore } from "./mud/mudStore";
import { initFaucetService } from "./mud/initFaucetService";
import { setupDevTools } from "./mud/setupDevTools";

type MUDContextValue = {
  network?: SetupNetworkResult;
  systemCalls?: ReturnType<typeof createSystemCalls>;
};

type SetupResult = {}; // TODO: define type

const MUDContext = createContext<SetupResult | null>(null);

type Props = {
  children: ReactNode;
};

export const MUDProvider = ({ children }: Props) => {
  const [value, setValue] = useState<MUDContextValue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <MUDContext.Provider value={value}>
      {/* TODO: handle loading states */}
      {loading && <div>Loading...</div>}
      {!loading && children}
    </MUDContext.Provider>
  );
};
