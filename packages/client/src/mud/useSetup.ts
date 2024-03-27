import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { useEffect } from "react";
import { getContract, Hex } from "viem";
import { useAccount } from "wagmi";
import { createSystemCalls } from "./createSystemCalls";
import { getNetworkConfig } from "./getNetworkConfig";
import { initFaucetService } from "./initFaucetService"; // TODO:
import { useMUDStore } from "./mudStore";
import { setupBurnerSigner } from "./setupBurnerSigner";
import { setupDevTools } from "./setupDevTools";
import { SetupNetworkResult, setupNetwork } from "./setupNetwork";
import { createUtilsCalls } from "./createUtilsCalls";
import { setupSmartAccountClient } from "./setupSmartAccountClient";

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
      // const burnerWalletClient = store.network.walletClient;
      // const burnerWalletClient = await setupBurnerSigner(network);
      const smartAccountWalletClient = await setupSmartAccountClient(networkConfig, network);
      const burnerWalletClient = smartAccountWalletClient; // TODO: remove this line

      // await initFaucetService(burnerWalletClient, network, networkConfig);

      const worldContract = getContract({
        address: networkConfig.worldAddress as Hex,
        abi: IWorldAbi,
        client: {
          public: network.publicClient,
          wallet: burnerWalletClient,
        },
      });
      const systemCalls = createSystemCalls(network, worldContract);
      const utilsCalls = createUtilsCalls(network, networkConfig, worldContract);

      store.set({
        status: "write",
        walletClient: burnerWalletClient,
        smartAccountWalletClient,
        worldContract,
        systemCalls,
        network,
        utilsCalls,
      });

      setupDevTools(network, burnerWalletClient, worldContract);
    };

    if (account?.isConnected && store.status === "read") {
      createWallet();
    }
  }, [account, store]);
}
