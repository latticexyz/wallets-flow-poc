import { useEffect, useState } from "react";
import { Flex, Text, Button, Dialog, Tabs } from "@radix-ui/themes";
import { useAccount } from "wagmi";
import { useWalletClient } from "wagmi";
import { useMUD, useMUDStore } from "../mud/mudStore";

type FlowState = "signer" | "balance" | "delegate" | "play";

const LatticeKitDialog = () => {
  const {
    utilsCalls: { registerUnlimitedDelegationWithSignatureNow, signAppSignerGenerationMessage }, // TODO: TS
    appSignerWalletClient,
    smartAccountWalletClient,
  } = useMUD();
  const store = useMUDStore();
  const [activeTab, setActiveTab] = useState<FlowState>("signer");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const account = useAccount();
  const isConnected = account?.isConnected;

  const mainWallet = useWalletClient();

  console.log("mainWallet", mainWallet);
  console.log("appSignerWalletClient", appSignerWalletClient);
  console.log("smartAccountWalletClient", smartAccountWalletClient);

  useEffect(() => {
    if (isConnected && !shown) {
      setOpen(true);
      setShown(true);
    }
  }, [shown, isConnected]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Content maxWidth="450px">
        <Tabs.Root value={activeTab}>
          <Tabs.Content value="signer">
            <Dialog.Title>Generate app-signer</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Generate app-signer description
            </Dialog.Description>

            <Text>More context ..</Text>

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
                <Button
                  onClick={async () => {
                    const appSignerWalletClient = await signAppSignerGenerationMessage(mainWallet.data);

                    store.set({
                      appSignerWalletClient,
                    });

                    setActiveTab("balance");
                  }}
                >
                  Generate signer
                </Button>
              </Dialog.Close>
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="balance">
            <Dialog.Title>Fund Redstone Balance</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Fund Redstone Balance description
            </Dialog.Description>

            <Text>More context ..</Text>

            <Button
              style={{ width: "100%", marginTop: "15px" }}
              onClick={() => {
                setActiveTab("delegate");
              }}
            >
              Relay.link
            </Button>
            <Button
              style={{ width: "100%", marginTop: "15px" }}
              onClick={() => {
                setActiveTab("delegate");
              }}
            >
              Redstone ETH
            </Button>
          </Tabs.Content>

          <Tabs.Content value="delegate">
            <Dialog.Title>Delegation</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Delegation description
            </Dialog.Description>

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
                <Button
                  onClick={() => {
                    if (mainWallet.data) {
                      // Declare a random delegatee
                      const delegatee = smartAccountWalletClient.account.address;
                      registerUnlimitedDelegationWithSignatureNow(
                        mainWallet.data,
                        smartAccountWalletClient,
                        appSignerWalletClient,
                        delegatee,
                      );
                    }

                    setActiveTab("play");
                  }}
                >
                  Set up delegation
                </Button>
              </Dialog.Close>
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="play">
            <Dialog.Title>You&apos;re all set up!</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Nothing more to do, let&apos;s play!
            </Dialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Close
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Let&apos;s play
                </Button>
              </Dialog.Close>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default LatticeKitDialog;
