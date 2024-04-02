import { Dialog } from "@radix-ui/themes";

export function LoginDialog() {
  return (
    <Dialog.Root>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Generate app-signer</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Generate app-signer description
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Root>
  );
}
