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

  useEffect(() => {
    const initSetup = async () => {
      try {
        const network: SetupNetworkResult = await setupNetwork();
        setValue({
          ...value,
          network,
        });
      } catch (error) {
        console.log("Error setting up MUD client", error);
      } finally {
        // TODO:
        // setLoading(false);
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
      const network = value?.network as SetupNetworkResult;
      const worldContract = getContract({
        address: networkConfig.worldAddress as Hex,
        abi: IWorldAbi,
        client: {
          public: network.publicClient,
          wallet: burnerWalletClient,
        },
      });
      const systemCalls = createSystemCalls(network, worldContract);

      setValue({
        ...value,
        systemCalls,
      });

      setLoading(false);
    };

    if (account?.isConnected && value?.network && value?.systemCalls == null) {
      createWallet();
    }
  }, [account, value]);

  // TODO: figure out how to handle loading state better
  return (
    <MUDContext.Provider value={value}>
      {/* TODO: handle loading states */}
      {loading && <div>Loading...</div>}
      {!loading && children}
    </MUDContext.Provider>
  );
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
