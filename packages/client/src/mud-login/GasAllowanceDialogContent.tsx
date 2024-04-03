import { Button, Dialog } from "@radix-ui/themes";
import { parseEther } from "viem";
import { store } from "./store";

export function GasAllowanceDialogContent() {
  return (
    <Dialog.Content>
      <Dialog.Title>Fund Redstone Balance</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Fund Redstone Balance description
      </Dialog.Description>

      <Button
        style={{ width: "100%", marginTop: "15px" }}
        onClick={() => {
          store.setState({ mockGasAllowance: parseEther("1") });
        }}
      >
        Relay.link
      </Button>
      <Button
        style={{ width: "100%", marginTop: "15px" }}
        onClick={() => {
          store.setState({ mockGasAllowance: parseEther("1") });
        }}
      >
        Redstone ETH
      </Button>
    </Dialog.Content>
  );
}
