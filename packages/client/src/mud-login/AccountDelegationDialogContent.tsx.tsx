import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useAppAccountClient } from "./useAppAccountClient";
import { usePublicClient, useWalletClient } from "wagmi";
import { useLoginConfig } from "./Context";
import modulesConfig from "@latticexyz/world-modules/mud.config";
import { getRecord } from "./getRecord";

export function AccountDelegationDialogContent() {
  const { worldAddress } = useLoginConfig();
  const publicClient = usePublicClient();
  const { data: eoaClient } = useWalletClient();
  const appAccountClient = useAppAccountClient();

  async function registerDelegation() {
    if (!publicClient) throw new Error("Public client not ready. Not connected?");
    if (!eoaClient) throw new Error("EOA client not ready. Not connected?");
    if (!appAccountClient) throw new Error("App account client not ready.");

    const record = await getRecord(publicClient, {
      storeAddress: worldAddress,
      table: modulesConfig.tables.UserDelegationNonces,
      key: { delegator: eoaClient.account.address },
    });

    return registerUnlimitedDelegationWithSignature(
      eoaClient,
      appAccountClient,
      appAccountClient.account.address,
      record.nonce,
    );
  }

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
        <Dialog.Close>
          <Button
            onClick={() => {
              // TODO: pending state
              registerDelegation();
            }}
          >
            Set up delegation
          </Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  );
}
