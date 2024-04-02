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

root.render(
  <Theme>
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <MUDProvider loadingComponent={<>Loading</>}>
            <App />
          </MUDProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </Theme>,
);
