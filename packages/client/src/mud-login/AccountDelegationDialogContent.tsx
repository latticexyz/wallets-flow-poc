import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useAppAccountClient } from "./useAppAccountClient";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useLoginConfig } from "./Context";
import modulesConfig from "@latticexyz/world-modules/mud.config";

import { getRecord } from "./getRecord";
import { useCreatePromise } from "./useCreatePromise";
import { Account, Address, Chain, Hex, Transport, WalletClient, encodeFunctionData } from "viem";
import { signTypedData, waitForTransactionReceipt, writeContract } from "viem/actions";
import { callWithSignatureTypes } from "@latticexyz/world/internal";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { SmartAccount } from "permissionless/accounts";
import { entryPoint, unlimitedDelegationControlId } from "./common";
import { SmartAccountClient } from "permissionless";
import { hasDelegation as checkHasDelegation } from "./hasDelegation";
import { useStore } from "./useStore";
import { usePromise } from "@latticexyz/react";
import { useMemo } from "react";
import { store } from "./store";
import { resourceToHex } from "@latticexyz/common";

// TODO: move this out and turn args into object
async function signCall(
  chainId: number,
  worldAddress: Address,
  walletClient: WalletClient<Transport, Chain, Account>,
  systemId: Hex,
  callData: Hex,
  nonce: bigint,
) {
  return await signTypedData(walletClient, {
    account: walletClient.account,
    domain: {
      chainId,
      verifyingContract: worldAddress,
    },
    types: callWithSignatureTypes,
    primaryType: "Call",
    message: {
      signer: walletClient.account.address,
      systemId,
      callData,
      nonce,
    },
  });
}

// TODO: move this out and turn args into object
async function registerDelegationWithSignature(
  chainId: number,
  worldAddress: Address,
  walletClient: WalletClient<Transport, Chain, Account>,
  appAccountClient: SmartAccountClient<typeof entryPoint, Transport, Chain, SmartAccount<typeof entryPoint>>,
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
  appAccountClient: SmartAccountClient<typeof entryPoint, Transport, Chain, SmartAccount<typeof entryPoint>>,
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
  const cacheHasDelegation = useStore((state) => state.hasDelegation);
  const { switchChain, isPending: switchChainPending } = useSwitchChain();

  const hasDelegationResult = usePromise(
    useMemo(async () => {
      if (cacheHasDelegation != null) return cacheHasDelegation;
      if (!publicClient) return false;
      if (!userAccount.address) return false;
      if (!appAccountClient) return false;

      const hasDelegation = await checkHasDelegation({
        publicClient,
        worldAddress,
        userAccountAddress: userAccount.address,
        appAccountAddress: appAccountClient.account.address,
      });

      store.setState({ hasDelegation });
      return hasDelegation;
    }, [appAccountClient, cacheHasDelegation, publicClient, userAccount.address, worldAddress]),
  );

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

    const hash = await registerUnlimitedDelegationWithSignature(
      chainId,
      worldAddress,
      walletClient,
      appAccountClient,
      appAccountClient.account.address,
      record.nonce,
    );

    const receipt = await waitForTransactionReceipt(publicClient, { hash });
    if (receipt.status === "reverted") {
      console.error("Failed to register delegation.", receipt);
      throw new Error("Failed to register delegation.");
    }

    store.setState({ hasDelegation: true });
  });

  return (
    <Dialog.Content>
      <Dialog.Title>Delegation</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Delegation description
      </Dialog.Description>

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
          <Button
            loading={hasDelegationResult.status === "pending" || registerDelegationResult.status === "pending"}
            onClick={registerDelegation}
          >
            Set up delegation
          </Button>
        )}
      </Flex>
    </Dialog.Content>
  );
}
