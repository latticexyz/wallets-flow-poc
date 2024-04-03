import { transportObserver } from "@latticexyz/common";
import { QueryClient } from "@tanstack/react-query";
import { createConfig, fallback, http, webSocket } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { getNetworkConfig } from "./mud/getNetworkConfig";

export const networkConfig = getNetworkConfig();

export const wagmiConfig = createConfig({
  chains: [networkConfig.chain],
  pollingInterval: 1_000,
  transports: {
    [networkConfig.chain.id]: transportObserver(fallback([webSocket(), http()])),
  },
});

// TODO: figure out how to get public client without !
export const publicClient = getPublicClient(wagmiConfig, { chainId: networkConfig.chain.id })!;

export const queryClient = new QueryClient();
