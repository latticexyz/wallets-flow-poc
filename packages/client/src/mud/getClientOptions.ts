import { fallback, webSocket, http, ClientConfig } from "viem";
import { transportObserver } from "@latticexyz/common";
import { NetworkConfig } from "./getNetworkConfig";

// TODO: cache?
// TODO: why TS error?
export const getClientOptions = (networkConfig: NetworkConfig): ClientConfig => {
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  return clientOptions;
};
