import { Button } from "@radix-ui/themes";
import { useLogin } from "./useLogin";

export function LoginButton() {
  const { currentRequirement, openConnectModal, openLoginDialog } = useLogin();

  if (currentRequirement === "connectedWallet") {
    return (
      <Button onClick={openConnectModal} loading={!openConnectModal}>
        Connect wallet
      </Button>
    );
  }

  if (currentRequirement === "appSigner") {
    return <Button onClick={openLoginDialog}>Login</Button>;
  }

  // TODO
  return <Button disabled>All good!</Button>;
}
