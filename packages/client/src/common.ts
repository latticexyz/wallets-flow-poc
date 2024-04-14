import { transportObserver } from "@latticexyz/common";
import { QueryClient } from "@tanstack/react-query";
import { createConfig, fallback, http, webSocket } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { getNetworkConfig } from "./mud/getNetworkConfig";
import { supportedChains } from "./mud/supportedChains";
import { MUDChain } from "@latticexyz/common/chains";

export const networkConfig = getNetworkConfig();

export const wagmiConfig = createConfig({
  chains: supportedChains as [MUDChain, ...MUDChain[]],
  pollingInterval: 1_000,
  // TODO: how to properly set up a transport config for all chains supported as bridge sources?
  transports: Object.fromEntries(
    supportedChains.map((chain) => {
      if (chain.rpcUrls.default.webSocket) return [chain.id, transportObserver(fallback([http(), webSocket()]))];
      return [chain.id, transportObserver(fallback([http()]))];
    }),
  ),
});

// TODO: figure out how to get public client without !
export const publicClient = getPublicClient(wagmiConfig, { chainId: networkConfig.chain.id })!;

export const queryClient = new QueryClient();
