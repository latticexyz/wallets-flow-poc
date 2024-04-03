import { useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { http } from "viem";
import { callFrom } from "@latticexyz/world/internal";
import { usePromise } from "@latticexyz/react";
import { SmartAccountClient, createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";
import { MOCK_PAYMASTER_ADDRESS } from "account-abstraction/src/deployPaymaster";
import { useLoginConfig } from "./Context";
import { useStore } from "./useStore";
import { entryPoint } from "./common";

export function useAppAccountClient(): SmartAccountClient<typeof entryPoint> | undefined {
  const appSignerAccount = useStore((state) => state.appSignerAccount);
  const { worldAddress } = useLoginConfig();
  const { address: eoaAddress } = useAccount();
  // TODO: replace with our own hook that is pinned to the specific chain
  const publicClient = usePublicClient();

  const result = usePromise(
    useMemo(async () => {
      if (!appSignerAccount) return;
      if (!eoaAddress) return;
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
                paymaster: MOCK_PAYMASTER_ADDRESS,
                paymasterData: "0x",
              },
            });

            return {
              paymasterData: "0x",
              paymaster: MOCK_PAYMASTER_ADDRESS,
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
            delegatorAddress: eoaAddress,
            publicClient,
          }),
        );

      return appAccountClient;
    }, [eoaAddress, appSignerAccount, worldAddress, publicClient]),
  );

  // TODO: handle errors

  return result.status === "fulfilled" ? result.value : undefined;
}
