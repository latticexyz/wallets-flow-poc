import { deployerClient } from "../src/deploy";
import { deployEntryPoint } from "../src/deployEntryPoint";
import { deployEntryPointSimulations } from "../src/deployEntryPointSimulations";
import { MOCK_PAYMASTER_ADDRESS, deployPaymaster } from "../src/deployPaymaster";
import { deploySimpleAccountFactory } from "../src/deploySimpleAccountFactory";
import { getContract, parseAbi, parseEther } from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { getGasTankAddress } from "../src/gasTank";

export async function deployContracts() {
  await deployEntryPoint();
  await deployEntryPointSimulations();
  await deploySimpleAccountFactory();
  await deployPaymaster();

  const mockPaymasterContract = getContract({
    address: MOCK_PAYMASTER_ADDRESS,
    abi: parseAbi(["function deposit() payable"]),
    client: deployerClient,
  });

  console.log(
    "funded mock paymaster",
    await waitForTransactionReceipt(deployerClient, {
      hash: await mockPaymasterContract.write.deposit({
        value: parseEther("50"),
      }),
    }),
  );

  console.log(
    "funded gas tank",
    await waitForTransactionReceipt(deployerClient, {
      hash: await writeContract(deployerClient, {
        address: getGasTankAddress(deployerClient.chain.id)!,
        abi: GasTankAbi,
        functionName: "depositTo",
        // TODO: replace with actual address
        args: ["0xd90807BB3bd1F7B4486ab94F5dc6eF9759e02aFa"],
        value: parseEther("50"),
      }),
    }),
  );
}

deployContracts();
