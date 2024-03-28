import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { useEffect } from "react";
import { getContract, Hex } from "viem";
import { useAccount } from "wagmi";
import { createSystemCalls } from "./createSystemCalls";
import { getNetworkConfig } from "./getNetworkConfig";
import { initFaucetService } from "./initFaucetService"; // TODO: add back
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
      // const appSignerWalletClient = store.network.walletClient;
      // const appSignerWalletClient = await setupBurnerSigner(network);

      const appSignerWalletClient = store.appSignerWalletClient;
      const smartAccountWalletClient = await setupSmartAccountClient(
        networkConfig,
        network,
        appSignerWalletClient,
        account.address,
      );
      // const appSignerWalletClient = smartAccountWalletClient; // TODO: remove this line

      // await initFaucetService(appSignerWalletClient, network, networkConfig); // TODO: add back faucet?

      const worldContract = getContract({
        address: networkConfig.worldAddress as Hex,
        abi: IWorldAbi,
        client: {
          public: network.publicClient,
          wallet: appSignerWalletClient,
        },
      });
      const systemCalls = createSystemCalls(network, worldContract);
      const utilsCalls = createUtilsCalls(network, networkConfig, worldContract);

      store.set({
        status: "write",
        walletClient: appSignerWalletClient,
        smartAccountWalletClient,
        worldContract,
        systemCalls,
        network,
        utilsCalls,
      });

      setupDevTools(network, appSignerWalletClient, worldContract);
    };

    console.log('store', store);

    if (account?.isConnected && store.appSignerWalletClient) {
      createWallet();
    }
  }, [account, store]);
}
