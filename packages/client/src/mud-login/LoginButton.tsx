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

  // TODO: refactor so we always display the login dialog for any of these to reduce the close/open transition when moving between states

  if (currentRequirement === "appSigner") {
    return (
      <>
        <Button onClick={openLoginDialog}>Set up</Button>
        <LoginDialog requirement={currentRequirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  if (currentRequirement === "gasAllowance") {
    return (
      <>
        <Button onClick={openLoginDialog}>Top up</Button>
        <LoginDialog requirement={currentRequirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  if (currentRequirement === "accountDelegation") {
    return (
      <>
        <Button onClick={openLoginDialog}>Log in</Button>
        <LoginDialog requirement={currentRequirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  // TODO
  return <Button disabled>All good!</Button>;
}
