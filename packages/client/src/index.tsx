// import "@rainbow-me/rainbowkit/styles.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { MUDProvider } from "./MUDContext";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { WagmiProvider } from "wagmi";
// import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
// import { AccountKitProvider } from "@latticexyz/account-kit";
import { networkConfig, queryClient, wagmiConfig } from "./common";
import { mount } from "@latticexyz/account-kit/bundle";

mount({
  wagmiConfig,
  accountKitConfig: {
    chain: networkConfig.chain,
    worldAddress: networkConfig.worldAddress,
    appInfo: {
      name: "Get Shit Done",
    },
    // erc4337: false,
  },
});

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <MUDProvider>
    <App />
  </MUDProvider>,
);
