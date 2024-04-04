import { useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { http } from "viem";
import { callFrom } from "@latticexyz/world/internal";
import { createSmartAccountClient } from "permissionless";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";
import { getGasTankAddress } from "account-abstraction/src/gasTank";
import { useLoginConfig } from "./Context";
import { useAppSigner } from "./useAppSigner";
import { useAppAccount } from "./useAppAccount";
import { AppAccountClient, accountAbstractionEntryPoint } from "./common";

export function useAppAccountClient(): AppAccountClient | undefined {
  const [appSignerAccount] = useAppSigner();
  const { chainId, worldAddress } = useLoginConfig();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: appAccount } = useAppAccount({ publicClient, appSignerAccount });

  const gasTankAddress = getGasTankAddress(chainId);

  return useMemo(() => {
    if (!appSignerAccount) return;
    if (!userAddress) return;
    if (!publicClient) return;
    if (!appAccount) return;

    const pimlicoBundlerClient = createPimlicoBundlerClient({
      chain: publicClient.chain,
      transport: http("http://127.0.0.1:4337"),
      entryPoint: accountAbstractionEntryPoint,
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
  }, [appSignerAccount, userAddress, publicClient, appAccount, worldAddress, gasTankAddress]);
}
