import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";
import { useAccount } from "wagmi";
import { Hex, getContract } from "viem";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createSystemCalls } from "./mud/createSystemCalls";
import { setupBurnerSigner } from "./mud/setupBurnerSigner";
import { setupNetwork, SetupNetworkResult } from "./mud/setupNetwork";
import { getNetworkConfig } from "./mud/getNetworkConfig";
import { useMUDStore } from "./mud/mudStore";

type MUDContextValue = {
  network?: SetupNetworkResult;
  systemCalls?: ReturnType<typeof createSystemCalls>;
};

type SetupResult = {}; // TODO: define type

const MUDContext = createContext<SetupResult | null>(null);

type Props = {
  children: ReactNode;
};

export const MUDProvider = ({ children }: Props) => {
  const [value, setValue] = useState<MUDContextValue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const account = useAccount();
  const store = useMUDStore();

  useEffect(() => {
    const initSetup = async () => {
      try {
        const network: SetupNetworkResult = await setupNetwork();
        store.setNetwork(network);
      } catch (error) {
        console.log("Error setting up MUD client", error);
      }
    };

    initSetup();
  }, []);

  useEffect(() => {
    const createWallet = async () => {
      const burnerWalletClient = await setupBurnerSigner();

      /*
       * Create an object for communicating with the deployed World.
       */
      const networkConfig = await getNetworkConfig();
      const network = store.network as SetupNetworkResult;
      const worldContract = getContract({
        address: networkConfig.worldAddress as Hex,
        abi: IWorldAbi,
        client: {
          public: network.publicClient,
          wallet: burnerWalletClient,
        },
      });
      const systemCalls = createSystemCalls(network, worldContract);

      store.setWalletClient(burnerWalletClient);
      store.setWorldContract(worldContract);
      store.setSystemCalls(systemCalls);

      setLoading(false);
    };

    if (
      account?.isConnected &&
      store.network != null &&
      store.worldContract == null &&
      store.systemCalls == null
    ) {
      createWallet();
    }
  }, [account, value, store]);

  return (
    <MUDContext.Provider value={value}>
      {/* TODO: handle loading states */}
      {loading && <div>Loading...</div>}
      {!loading && children}
    </MUDContext.Provider>
  );
};

