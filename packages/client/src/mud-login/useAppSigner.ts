import { PrivateKeyAccount, Hex } from "viem";
import { useLocalStorage } from "usehooks-ts";
import { privateKeyToAccount } from "viem/accounts";
import { useMemo } from "react";

export const storageKey = "mud:appSigner:privateKey";

export function useAppSigner(): [PrivateKeyAccount | null, (privateKey: Hex) => void] {
  const [privateKey, setPrivateKey] = useLocalStorage<Hex | null>(storageKey, null);
  return useMemo(
    () => [privateKey ? privateKeyToAccount(privateKey) : null, setPrivateKey],
    [privateKey, setPrivateKey],
  );
}
