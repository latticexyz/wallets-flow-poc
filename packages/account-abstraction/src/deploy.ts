import { Address, Hex, createWalletClient, http, publicActions } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

const account = mnemonicToAccount("test test test test test test test test test test test junk", { addressIndex: 2 });

export const deployerClient = createWalletClient({
  account,
  chain: foundry,
  transport: http("http://127.0.0.1:8545"),
}).extend(publicActions);

export const deterministicDeployer: Address = "0x4e59b44847b379578588920ca78fbf26c0b4956c";

export async function deploy(data: Hex, expectedAddress: Address) {
  const bytecode = await deployerClient.getBytecode({
    address: expectedAddress,
  });
  if (bytecode && bytecode !== "0x") {
    console.log("Skipping deployment of contract", expectedAddress);
    return;
  }

  const hash = await deployerClient.sendTransaction({
    to: deterministicDeployer,
    data,
  });
  const receipt = await deployerClient.waitForTransactionReceipt({ hash });
  return receipt;
}
