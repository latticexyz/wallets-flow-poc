import "@radix-ui/themes/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { MUDProvider } from "./MUDContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { foundry } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { transportObserver } from "@latticexyz/common";
import { fallback, webSocket } from "viem";
import { Theme } from "@radix-ui/themes";
import { MUDLoginProvider } from "./mud-login";
import { getNetworkConfig } from "./mud/getNetworkConfig";

const config = createConfig({
  chains: [foundry],
  pollingInterval: 1_000,
  transports: {
    [foundry.id]: transportObserver(fallback([webSocket(), http()])),
  },
});

const client = new QueryClient();

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const networkConfig = getNetworkConfig();

root.render(
  <Theme>
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <MUDLoginProvider config={{ chainId: networkConfig.chainId, worldAddress: networkConfig.worldAddress }}>
            <MUDProvider loadingComponent={<>Loading</>}>
              <App />
            </MUDProvider>
          </MUDLoginProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </Theme>,
);
