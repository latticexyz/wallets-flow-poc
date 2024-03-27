import { useEffect, useState } from "react";
import { Flex, Text, Button, Dialog, Tabs } from "@radix-ui/themes";
import { useAccount } from "wagmi";
import { useWalletClient } from "wagmi";
import { useMUD } from "../MUDContext";

type FlowState = "signer" | "balance" | "delegate" | "play";

const LatticeKitDialog = () => {
  const {
    network: { registerUnlimitedDelegationWithSignature },
  } = useMUD();

  const [activeTab, setActiveTab] = useState<FlowState>("signer");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const account = useAccount();
  const isConnected = account?.isConnected;

  const walletClientResult = useWalletClient();

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
                  onClick={() => {
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
                    if (walletClientResult.data) {
                      // Declare delegation parameters
                      const delegatee = "0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377";
                      const nonce = 0n;

                      registerUnlimitedDelegationWithSignature(walletClientResult.data, delegatee, nonce);
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
