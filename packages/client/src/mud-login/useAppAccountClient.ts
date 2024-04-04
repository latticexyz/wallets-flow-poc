import { useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { Chain, Transport, http } from "viem";
import { callFrom } from "@latticexyz/world/internal";
import { usePromise } from "@latticexyz/react";
import { SmartAccountClient, createSmartAccountClient } from "permissionless";
import { SmartAccount, signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";
import { getGasTankAddress } from "account-abstraction/src/gasTank";
import { useLoginConfig } from "./Context";
import { entryPoint } from "./common";
import { useAppSigner } from "./useAppSigner";

export function useAppAccountClient():
  | SmartAccountClient<typeof entryPoint, Transport, Chain, SmartAccount<typeof entryPoint>>
  | undefined {
  const [appSignerAccount] = useAppSigner();
  const { chainId, worldAddress } = useLoginConfig();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient({ chainId });

  const gasTankAddress = getGasTankAddress(chainId);

  const result = usePromise(
    useMemo(async () => {
      if (!appSignerAccount) return;
      if (!userAddress) return;
      if (!publicClient) return;

      const pimlicoBundlerClient = createPimlicoBundlerClient({
        chain: publicClient.chain,
        transport: http("http://127.0.0.1:4337"),
        entryPoint,
      });

      const appAccount = await signerToSimpleSmartAccount(publicClient, {
        entryPoint,
        factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
        signer: appSignerAccount,
      });

      const appAccountClient = createSmartAccountClient({
        chain: publicClient.chain,
        account: appAccount,
        bundlerTransport: http("http://127.0.0.1:4337"),
        middleware: {
          sponsorUserOperation: async ({ userOperation }) => {
            const gasEstimates = await pimlicoBundlerClient.estimateUserOperationGas({
              userOperation: {
                ...userOperation,
                paymaster: gasTankAddress,
                paymasterData: "0x",
              },
            });

            return {
              paymasterData: "0x",
              paymaster: gasTankAddress,
              ...gasEstimates,
            };
          },
          gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
        },
      })
        // TODO: can we replace the below with all publicActions?
        // .extend(publicActions(publicClient))
        .extend(() => ({
          getTransactionCount: (args) => {
            console.log("getTransactionCount, ", args);
            return getTransactionCount(publicClient, args);
          },
          call: (args) => call(publicClient, args),
        }))
        // .extend(transactionQueue(publicClient))
        // .extend(writeObserver({ onWrite: (write) => write$.next(write) }))
        .extend(
          callFrom({
            worldAddress,
            delegatorAddress: userAddress,
            publicClient,
          }),
        );

      return appAccountClient;
    }, [userAddress, appSignerAccount, worldAddress, publicClient]),
  );

  // TODO: handle errors

  if (result.status === "rejected") {
    console.log("failed to get app account client", result.reason);
  }

  return result.status === "fulfilled" ? result.value : undefined;
}
