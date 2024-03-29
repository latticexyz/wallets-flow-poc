import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { useEffect } from "react";
import { getContract, Hex } from "viem";
import { useAccount } from "wagmi";
import { createSystemCalls } from "./createSystemCalls";
import { getNetworkConfig } from "./getNetworkConfig";
import { initFaucetService } from "./initFaucetService"; // TODO: add back
import { useMUDStore } from "./mudStore";
import { setupDevTools } from "./setupDevTools";
import { SetupNetworkResult, setupNetwork } from "./setupNetwork";
import { createUtilsCalls } from "./createUtilsCalls";
import { setupSmartAccountClient } from "./utils/setupSmartAccountClient";

export function useSetup() {
  const account = useAccount();
  const store = useMUDStore();

  useEffect(() => {
    const initSetup = async () => {
      try {
        const network: SetupNetworkResult = await setupNetwork();
        store.set({ status: "read", network });
      } catch (error) {
        console.log("Error setting up MUD client", error);
      }
    };

    initSetup();
  }, []);

  useEffect(() => {
    const createWallet = async () => {
      if (store.status === "loading") {
        console.warn("Can not setup wallet before initial setup is done");
        return;
      }

      if (store.status === "write") {
        console.warn("Wallet is already set up");
        return;
      }

      /*
       * Create an object for communicating with the deployed World.
       */
      const networkConfig = await getNetworkConfig();
      const network = store.network as SetupNetworkResult;
      const appSignerWalletClient = store.appSignerWalletClient;
      const smartAccountWalletClient = await setupSmartAccountClient(
        networkConfig,
        network,
        appSignerWalletClient,
        account.address,
      );

      // await initFaucetService(appSignerWalletClient, network, networkConfig); // TODO: add back faucet?

      const worldContract = getContract({
        address: networkConfig.worldAddress as Hex,
        abi: IWorldAbi,
        client: {
          public: network.publicClient,
          wallet: smartAccountWalletClient,
        },
      });
      const systemCalls = createSystemCalls(network, worldContract);
      const utilsCalls = createUtilsCalls(network, networkConfig, worldContract);

      store.set({
        status: "write",
        smartAccountWalletClient,
        worldContract,
        network,
        utilsCalls,
        systemCalls,
      });

      setupDevTools(network, appSignerWalletClient, worldContract);
    };

    if (account?.isConnected && store.appSignerWalletClient && !store.smartAccountWalletClient) {
      createWallet();
    }
  }, [account, store]);
}
