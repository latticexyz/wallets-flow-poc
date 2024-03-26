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
import { useSetup } from "./mud/useSetup";

type Props = {
  children: ReactNode;
  loadingComponent: ReactNode;
};

export const MUDProvider = ({ children, loadingComponent }: Props) => {
  useSetup();

  const status = useMUDStore((state) => state.state);

  return (
    <>
      {/* TODO: handle loading states */}
      {status === "loading" && loadingComponent}
      {status !== "loading" && children}
    </>
  );
};
