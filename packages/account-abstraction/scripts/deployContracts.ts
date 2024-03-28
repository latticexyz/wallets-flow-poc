import { deployerClient } from "../src/deploy";
import { deployEntryPoint } from "../src/deployEntryPoint";
import { deployEntryPointSimulations } from "../src/deployEntryPointSimulations";
import { MOCK_PAYMASTER_ADDRESS, deployPaymaster } from "../src/deployPaymaster";
import { deploySimpleAccountFactory } from "../src/deploySimpleAccountFactory";
import { getContract, parseAbi, parseEther } from "viem";

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

  const depositHash = await mockPaymasterContract.write.deposit({
    value: parseEther("50"),
  });
  console.log("funded paymaster", depositHash);
}

deployContracts();
