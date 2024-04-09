import "@rainbow-me/rainbowkit/styles.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { MUDProvider } from "./MUDContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";
import { MUDLoginProvider } from "@latticexyz/account-kit";
import { networkConfig, queryClient, wagmiConfig } from "./common";
import { getGasTankAddress } from "account-abstraction/src/gasTank";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={midnightTheme({ borderRadius: "none" })}>
        <MUDLoginProvider
          config={{
            chainId: networkConfig.chainId,
            worldAddress: networkConfig.worldAddress,
            gasTankAddress: getGasTankAddress(networkConfig.chainId)!,
          }}
        >
          <MUDProvider>
            <App />
          </MUDProvider>
        </MUDLoginProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
);
