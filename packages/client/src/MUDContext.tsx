import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";
import { setup, SetupResult } from "./mud/setup";

const MUDContext = createContext<SetupResult | null>(null);

type Props = {
  children: ReactNode;
};

export const MUDProvider = ({ children }: Props) => {
  const [value, setValue] = useState<SetupResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initSetup = async () => {
      try {
        const setupResult: SetupResult = await setup();
        setValue(setupResult);
      } catch (error) {
        console.log("Error setting up MUD client", error);
      } finally {
        setLoading(false);
      }
    };

    initSetup();
  }, []);

  // TODO: figure out how to handle loading state better
  return (
    <MUDContext.Provider value={value}>
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
