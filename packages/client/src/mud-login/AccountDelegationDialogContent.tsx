import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useAppAccountClient } from "./useAppAccountClient";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useLoginConfig } from "./Context";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";

import { getRecord } from "./getRecord";
import { useCreatePromise } from "./useCreatePromise";
import { Account, Address, Chain, Hex, Transport, WalletClient, encodeFunctionData } from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { AppAccountClient, unlimitedDelegationControlId } from "./common";
import { store } from "./store";
import { resourceToHex } from "@latticexyz/common";
import { signCall } from "./signCall";

// TODO: move this out and turn args into object
async function registerDelegationWithSignature(
  chainId: number,
  worldAddress: Address,
  walletClient: WalletClient<Transport, Chain, Account>,
  appAccountClient: AppAccountClient,
  delegatee: Hex,
  delegationControlId: Hex,
  initCallData: Hex,
  nonce: bigint,
) {
  const systemId = resourceToHex({ type: "system", namespace: "", name: "Registration" });
  const callData = encodeFunctionData({
    abi: IBaseWorldAbi,
    functionName: "registerDelegation",
    args: [delegatee, delegationControlId, initCallData],
  });

  const signature = await signCall(chainId, worldAddress, walletClient, systemId, callData, nonce);

  return writeContract(appAccountClient, {
    address: worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    args: [walletClient.account.address, systemId, callData, signature],
  });
}

// TODO: move this out and turn args into object
function registerUnlimitedDelegationWithSignature(
  chainId: number,
  worldAddress: Address,
  walletClient: WalletClient<Transport, Chain, Account>,
  appAccountClient: AppAccountClient,
  delegatee: Hex,
  nonce: bigint,
) {
  return registerDelegationWithSignature(
    chainId,
    worldAddress,
    walletClient,
    appAccountClient,
    delegatee,
    unlimitedDelegationControlId,
    "0x",
    nonce,
  );
}

export function AccountDelegationDialogContent() {
  const { chainId, worldAddress } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient({ chainId });
  const userAccount = useAccount();
  const appAccountClient = useAppAccountClient();
  const { switchChain, isPending: switchChainPending } = useSwitchChain();

  const [registerDelegationResult, registerDelegation] = useCreatePromise(async () => {
    if (!publicClient) throw new Error("Public client not ready. Not connected?");
    if (!walletClient) throw new Error("Wallet client not ready. Not connected?");
    if (!userAccount.address) throw new Error("User account not ready. Not connected?");
    if (!appAccountClient) throw new Error("App account client not ready.");

    const record = await getRecord(publicClient, {
      storeAddress: worldAddress,
      table: modulesConfig.tables.CallWithSignatureNonces,
      key: { signer: userAccount.address },
    });
    console.log("got nonce", record);

    console.log("registerDelegation");
    const hash = await registerUnlimitedDelegationWithSignature(
      chainId,
      worldAddress,
      walletClient,
      appAccountClient,
      appAccountClient.account.address,
      record.nonce,
    );
    console.log("registerDelegation tx", hash);

    const receipt = await waitForTransactionReceipt(publicClient, { hash });
    console.log("registerDelegation receipt", receipt);
    if (receipt.status === "reverted") {
      console.error("Failed to register delegation.", receipt);
      throw new Error("Failed to register delegation.");
    }

    // TODO: invalidate delegation query key
    store.setState({ delegationTransaction: hash });
  });

  return (
    <Dialog.Content>
      <Dialog.Title>Delegation</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Delegation description
      </Dialog.Description>

      {registerDelegationResult.status === "rejected" ? <>Error: {String(registerDelegationResult.reason)}</> : null}

      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>
        {userAccount.chainId !== chainId ? (
          <Button loading={switchChainPending} onClick={() => switchChain({ chainId })}>
            Switch chain
          </Button>
        ) : (
          <Button loading={registerDelegationResult.status === "pending"} onClick={registerDelegation}>
            Set up delegation
          </Button>
        )}
      </Flex>
    </Dialog.Content>
  );
}
