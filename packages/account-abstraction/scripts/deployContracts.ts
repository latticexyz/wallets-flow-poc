import { deployEntryPoint } from "../src/deployEntryPoint";
import { deployEntryPointSimulations } from "../src/deployEntryPointSimulations";
import { deploySimpleAccountFactory } from "../src/deploySimpleAccountFactory";

export async function deployContracts() {
  await deployEntryPoint();
  await deployEntryPointSimulations();
  await deploySimpleAccountFactory();
}

deployContracts();
