import { Button } from "@radix-ui/themes";
import { useLoginDialog } from "./useLoginDialog";
import { LoginDialog } from "./LoginDialog";
import { useLoginRequirements } from "./useLoginRequirements";

export function LoginButton() {
  const { requirement } = useLoginRequirements();
  const { openConnectModal, openLoginDialog, toggleLoginDialog, loginDialogOpen } = useLoginDialog();

  if (requirement === "connectedWallet") {
    return (
      <Button onClick={openConnectModal} loading={!openConnectModal}>
        Connect wallet
      </Button>
    );
  }

  // TODO: refactor so we always display the login dialog for any of these to reduce the close/open transition when moving between states

  if (requirement === "appSigner") {
    return (
      <>
        <Button onClick={openLoginDialog}>Set up</Button>
        <LoginDialog requirement={requirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  if (requirement === "gasAllowance") {
    return (
      <>
        <Button onClick={openLoginDialog}>Top up</Button>
        <LoginDialog requirement={requirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  if (requirement === "accountDelegation") {
    return (
      <>
        <Button onClick={openLoginDialog}>Log in</Button>
        <LoginDialog requirement={requirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  // TODO
  return <Button disabled>All good!</Button>;
}
