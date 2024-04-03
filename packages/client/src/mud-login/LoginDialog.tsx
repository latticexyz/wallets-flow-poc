import { Dialog } from "@radix-ui/themes";
import { AppSignerDialogContent } from "./AppSignerDialogContent";
import { GasAllowanceDialogContent } from "./GasAllowanceDialogContent";
import { AccountDelegationDialogContent } from "./AccountDelegationDialogContent";
import { LoginRequirement } from "./common";
import { useMemo } from "react";
import { assertExhaustive } from "@latticexyz/common/utils";
import { satisfy } from "@latticexyz/common/type-utils";

export type Props = Pick<Dialog.RootProps, "open" | "onOpenChange"> & {
  requirement: satisfy<LoginRequirement, "appSigner" | "gasAllowance" | "accountDelegation">;
};

export function LoginDialog({ requirement, ...dialogProps }: Props) {
  const content = useMemo(() => {
    switch (requirement) {
      case "appSigner":
        return <AppSignerDialogContent />;
      case "gasAllowance":
        return <GasAllowanceDialogContent />;
      case "accountDelegation":
        return <AccountDelegationDialogContent />;
      default:
        return assertExhaustive(requirement);
    }
  }, [requirement]);

  return <Dialog.Root {...dialogProps}>{content}</Dialog.Root>;
}
