import { Dialog } from "@radix-ui/themes";
import { useLogin } from "./useLogin";
import { AppSignerDialogContent } from "./AppSignerDialogContent";

export type Props = Pick<Dialog.RootProps, "open" | "onOpenChange">;

export function LoginDialog(props: Props) {
  const { currentRequirement } = useLogin();
  return <Dialog.Root {...props}>{currentRequirement === "appSigner" ? <AppSignerDialogContent /> : null}</Dialog.Root>;
}
