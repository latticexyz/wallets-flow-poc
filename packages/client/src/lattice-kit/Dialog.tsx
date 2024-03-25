import { useEffect, useState } from "react";
import { Flex, Text, Button, Dialog, TextField } from "@radix-ui/themes";
import { useAccount } from "wagmi";

const LatticeKitDialog = () => {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const account = useAccount();
  const isConnected = account?.isConnected;

  console.log(account);
  console.log(account?.address);
  console.log(account?.isConnected);

  useEffect(() => {
    console.log("isConnected", isConnected);

    if (isConnected && !shown) {
      setOpen(true);
      setShown(true);
    }
  }, [shown, isConnected]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Generate app-signer</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Generate app-signer description
        </Dialog.Description>

        <Flex direction="column" gap="3">
          More context ..
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button
              variant="soft"
              color="gray"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button>Generate signer</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default LatticeKitDialog;
