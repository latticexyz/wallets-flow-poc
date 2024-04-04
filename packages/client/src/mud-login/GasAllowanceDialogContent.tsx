import { Button, Dialog, Flex } from "@radix-ui/themes";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { useLoginConfig } from "./Context";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { getGasTankBalanceKey } from "./useGasTankBalance";
import { queryClient } from "../common";

export function GasAllowanceDialogContent() {
  const { chainId, gasTankAddress } = useLoginConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { writeContractAsync, isPending, error } = useWriteContract();

  return (
    <Dialog.Content>
      <Dialog.Title>Fund Redstone Balance</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Fund Redstone Balance description
      </Dialog.Description>

      {error ? <div>{String(error)}</div> : null}

      <Flex direction="column" gap="2">
        <Button
          loading={!userAccountAddress || isPending}
          onClick={async () => {
            if (!userAccountAddress) return;

            await writeContractAsync({
              address: gasTankAddress,
              abi: GasTankAbi,
              functionName: "depositTo",
              args: [userAccountAddress],
              value: parseEther("0.01"),
            });
            queryClient.invalidateQueries({
              queryKey: getGasTankBalanceKey({ chainId, gasTankAddress, userAccountAddress }),
            });
          }}
        >
          Deposit to gas tank
        </Button>
        <Button disabled>Relay.link</Button>
        <Button disabled>Redstone ETH</Button>
      </Flex>
    </Dialog.Content>
  );
}
