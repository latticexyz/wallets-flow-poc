import { ReactNode } from "react";
import { useMUDStore } from "./mud/mudStore";
import { useSetup } from "./mud/useSetup";

type Props = {
  children: ReactNode;
  loadingComponent: ReactNode;
};

export const MUDProvider = ({ children, loadingComponent }: Props) => {
  useSetup();

  const status = useMUDStore((state) => state.status);

  return (
    <>
      {status === "loading" && loadingComponent}
      {status !== "loading" && children}
    </>
  );
};
