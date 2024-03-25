import { fallback, webSocket, http, ClientConfig } from "viem";
import { transportObserver } from "@latticexyz/common";
import { NetworkConfig } from "./getNetworkConfig";

// TODO: cache?
<<<<<<< HEAD
=======
// TODO: why TS error?
>>>>>>> 1fded51 (refactor MUDContext)
export const getClientOptions = (networkConfig: NetworkConfig): ClientConfig => {
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  return clientOptions;
};
