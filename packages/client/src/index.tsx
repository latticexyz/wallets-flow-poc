import "@rainbow-me/rainbowkit/styles.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { MUDProvider } from "./MUDContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";
import { MUDAccountKitProvider } from "@latticexyz/account-kit";
import { networkConfig, queryClient, wagmiConfig } from "./common";
import worlds from "@latticexyz/gas-tank/worlds.json";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={midnightTheme({ borderRadius: "none" })}>
        <MUDAccountKitProvider
          config={{
            chainId: networkConfig.chainId,
            worldAddress: networkConfig.worldAddress,
            gasTankAddress: (worlds as any)[networkConfig.chainId].address,
          }}
        >
          <MUDProvider>
            <App />
          </MUDProvider>
        </MUDAccountKitProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
);
