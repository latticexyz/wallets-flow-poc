import ReactDOM from "react-dom/client";
import { App } from "./App";
import { MUDProvider } from "./MUDContext";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { transportObserver } from "@latticexyz/common";
import { fallback, webSocket } from "viem";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

const config = createConfig({
  chains: [hardhat],
  pollingInterval: 1_000,
  transports: {
    [hardhat.id]: transportObserver(fallback([webSocket(), http()])),
  },
});

const client = new QueryClient();

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <Theme>
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <MUDProvider>
            <App />
          </MUDProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </Theme>,
);
