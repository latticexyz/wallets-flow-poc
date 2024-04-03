import { ReactNode, createContext, useContext, useMemo } from "react";
import { usePromise } from "@latticexyz/react";
import { SetupNetworkResult, setupNetwork } from "./mud/setupNetwork";

/** @internal */
const MUDContext = createContext<SetupNetworkResult | null>(null);

export type Props = {
  children: ReactNode;
};

export function MUDProvider({ children }: Props) {
  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("`MUDProvider` can only be used once.");

  const setupNetworkResult = usePromise(useMemo(async () => await setupNetwork(), []));

  if (setupNetworkResult.status === "fulfilled") {
    return <MUDContext.Provider value={setupNetworkResult.value}>{children}</MUDContext.Provider>;
  }

  if (setupNetworkResult.status === "rejected") {
    throw setupNetworkResult.reason;
  }

  // TODO: allow this to be configured
  return <>Loading…</>;
}

export function useMUD() {
  const value = useContext(MUDContext);
  if (!value) throw new Error("`useMUD` must be used within a `MUDProvider`.");
  return value;
}
