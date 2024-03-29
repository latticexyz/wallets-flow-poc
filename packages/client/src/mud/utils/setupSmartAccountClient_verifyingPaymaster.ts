import { Chain } from "viem";
import { NetworkConfig } from "../getNetworkConfig";
import { SetupNetworkResult } from "../setupNetwork";
import { http, PrivateKeyAccount, parseEther, Address, createWalletClient } from "viem";
import { writeObserver } from "@latticexyz/common/actions";
import { callFrom } from "@latticexyz/world/internal";
import { ENTRYPOINT_ADDRESS_V07, createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";
import { mnemonicToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { getClientOptions } from "../getClientOptions";

export async function setupSmartAccountClient(
  networkConfig: NetworkConfig,
  network: SetupNetworkResult,
  appSigner: PrivateKeyAccount,
  accountAddress: Address,
) {
  const clientOptions = getClientOptions(networkConfig);
  const publicClient = network.publicClient;
  const write$ = network.write$;

  const pimlicoBundlerClient = createPimlicoBundlerClient({
    chain: clientOptions.chain,
    transport: http("http://127.0.0.1:4337"),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  // 1. Create app signer
  // const appSigner = createBurnerAccount(networkConfig.privateKey as Hex) as PrivateKeyAccount;

  // 2. Create smart account for app
  const appSmartAccount = await signerToSimpleSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    signer: appSigner,
  });

  // 3. Create smart account client for app
  const appSmartAccountClient = createSmartAccountClient({
    chain: clientOptions.chain,
    bundlerTransport: http("http://127.0.0.1:4337"),
    middleware: {
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
        // TODO: handle EOA changes
        delegatorAddress: accountAddress,
        publicClient,
      }),
    );

  ////////////////////
  // JUST IN DEV
  // TODO: might be able to remove?
  async function seedAccount(to: Address, chain: Chain) {
    const account = mnemonicToAccount("test test test test test test test test test test test junk", {
      addressIndex: 3,
    });

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http("http://localhost:8545"),
    });

    await walletClient.sendTransaction({
      to,
      value: parseEther("5"),
    });
  }

  await seedAccount(appSmartAccount.address, foundry);
  ///////////////////

  return appSmartAccountClient;
}
