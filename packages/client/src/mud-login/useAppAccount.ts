import { usePublicClient } from "wagmi";
import { Chain, PrivateKeyAccount, PublicClient, Transport } from "viem";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { useLoginConfig } from "./Context";
import { useAppSigner } from "./useAppSigner";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { AppAccount, accountAbstractionEntryPoint, smartAccountFactory } from "./common";

type GetAppAccountOptions = {
  publicClient: PublicClient<Transport, Chain>;
  appSignerAccount: PrivateKeyAccount;
};

async function getAppAccount({ publicClient, appSignerAccount }: GetAppAccountOptions): Promise<AppAccount> {
  console.log("fetching app account for signer");
  return await signerToSimpleSmartAccount(publicClient, {
    entryPoint: accountAbstractionEntryPoint,
    factoryAddress: smartAccountFactory,
    signer: appSignerAccount,
  });
}

// TODO: require app signer and public key to be passed in?
export function useAppAccount(): UseQueryResult<AppAccount> {
  const { chainId } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });
  const [appSignerAccount] = useAppSigner();

  const queryKey = [
    "mud:appAccount",
    publicClient?.chain.id,
    accountAbstractionEntryPoint,
    smartAccountFactory,
    appSignerAccount?.address,
  ] as const;

  return useQuery(
    publicClient && appSignerAccount
      ? {
          queryKey,
          queryFn: () => getAppAccount({ publicClient, appSignerAccount }),
        }
      : {
          queryKey,
          enabled: false,
        },
  );
}
