import { Button } from "@radix-ui/themes";
import { useLogin } from "./useLogin";

export function LoginButton() {
  const { requirements, openConnectModal } = useLogin();

  if (requirements.includes("connected-wallet")) {
    return (
      <Button onClick={openConnectModal} loading={!openConnectModal}>
        Login
      </Button>
    );
  }

  // TODO
  return <Button disabled>All good!</Button>;
}
