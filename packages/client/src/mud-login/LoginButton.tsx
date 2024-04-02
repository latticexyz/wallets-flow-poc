import { Button } from "@radix-ui/themes";
import { useLogin } from "./useLogin";
import { LoginDialog } from "./LoginDialog";

export function LoginButton() {
  const { currentRequirement, openConnectModal, openLoginDialog, toggleLoginDialog, loginDialogOpen } = useLogin();

  if (currentRequirement === "connectedWallet") {
    return (
      <Button onClick={openConnectModal} loading={!openConnectModal}>
        Connect wallet
      </Button>
    );
  }

  if (currentRequirement === "appSigner") {
    return (
      <>
        <Button onClick={openLoginDialog}>Login</Button>
        <LoginDialog open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  // TODO
  return <Button disabled>All good!</Button>;
}
