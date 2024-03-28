import { http, Address, WalletClient } from "viem";
import { NetworkConfig } from "./getNetworkConfig";
import { writeObserver } from "@latticexyz/common/actions";
import { callFrom } from "@latticexyz/world/internal";
import { ENTRYPOINT_ADDRESS_V07, createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";
import { MOCK_PAYMASTER_ADDRESS } from "../../../account-abstraction/src/deployPaymaster";
import { getClientOptions } from "./getClientOptions";
import { SetupNetworkResult } from "./setupNetwork";

export async function setupSmartAccountClient(
  networkConfig: NetworkConfig,
  network: SetupNetworkResult,
  appSigner: WalletClient, // app-signer wallet client
  accountAddress: Address, // account address of EOA account
) {
  const clientOptions = getClientOptions(networkConfig);
  const publicClient = network.publicClient;
  const write$ = network.write$;

  const pimlicoBundlerClient = createPimlicoBundlerClient({
    chain: clientOptions.chain,
    transport: http("http://127.0.0.1:4337"),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  const appSmartAccount = await signerToSimpleSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    signer: appSigner,
  });

  const appSmartAccountClient = createSmartAccountClient({
    chain: clientOptions.chain,
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
    account: appSmartAccount,
  })
    .extend(() => ({
      getTransactionCount: (args) => {
        console.log("getTransactionCount, ", args);
        return getTransactionCount(publicClient, args);
      },
      call: (args) => call(publicClient, args),
    }))
    // .extend(transactionQueue(publicClient))
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }))
    .extend(
      callFrom({
        worldAddress: networkConfig.worldAddress,
        // TODO: how can we get access to the main wallet here?
        // Maybe setting up the `wallet client` should be somehow separate from the initial network setup,
        // since it depends on the main user wallet being connected.
        // Also, what if the user changes their main wallet? How do we update the burner wallet?
        delegatorAddress: accountAddress,
        publicClient,
      }),
    );

  return appSmartAccountClient;
}
