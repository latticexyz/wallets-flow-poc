import { WalletClient, parseEther } from "viem";
import { createFaucetService } from "@latticexyz/services/faucet";
import { NetworkConfig } from "./getNetworkConfig";
import { SetupNetworkResult } from "./setupNetwork";

export function initFaucetService(
  burnerSigner: WalletClient,
  network: SetupNetworkResult,
  networkConfig: NetworkConfig,
) {
  /*
   * If there is a faucet, request (test) ETH if you have
   * less than 1 ETH. Repeat every 20 seconds to ensure you don't
   * run out.
   */
  if (networkConfig.faucetServiceUrl && burnerSigner?.account?.address) {
    const address = burnerSigner.account.address;
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const publicClient = network.publicClient;
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance < parseEther("1");
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");
        // Double drip
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  }
}
