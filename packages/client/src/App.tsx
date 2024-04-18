import { getContract } from "viem";
import { useMUD } from "./MUDContext";
import { createSystemCalls } from "./mud/createSystemCalls";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { networkConfig, publicClient, wagmiConfig } from "./common";
import { useEffect, useRef } from "react";
import config from "contracts/mud.config";
import { useStore } from "zustand";
import { store as accountKitStore, mountButton } from "@latticexyz/account-kit/bundle";

export const App = () => {
  const network = useMUD();
  // const appAccountClient = useAppAccountClient();
  // const { openAccountModal } = useAccountModal();

  const appAccountClient = useStore(accountKitStore, (state) => state.appAccountClient);
  const openAccountModal = useStore(accountKitStore, (state) => state.openAccountModal);

  // useEffect(() => {
  //   openAccountModal?.();
  // }, [openAccountModal]);

  const worldContract = getContract({
    abi: IWorldAbi,
    address: networkConfig.worldAddress,
    client: {
      public: publicClient,
      wallet: appAccountClient,
    },
  });

  const systemCalls = createSystemCalls(network, worldContract);

  useEffect(() => {
    if (!appAccountClient) return;

    // https://vitejs.dev/guide/env-and-mode.html
    async function mount() {
      if (import.meta.env.DEV) {
        const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
        return mountDevTools({
          config,
          publicClient,
          // TODO: fix type, also make walletClient optional?
          // TODO: allow multiple calls to mount to update
          walletClient: appAccountClient!,
          latestBlock$: network.latestBlock$,
          storedBlockLogs$: network.storedBlockLogs$,
          worldAddress: worldContract.address,
          worldAbi: worldContract.abi,
          write$: network.write$,
          useStore: network.useStore,
        });
      }
    }
    const unmountPromise = mount();
    return () => {
      unmountPromise.then((unmount) => unmount?.());
    };
  }, [
    appAccountClient,
    network.latestBlock$,
    network.storedBlockLogs$,
    network.useStore,
    network.write$,
    worldContract.abi,
    worldContract.address,
  ]);

  const tasks = network.useStore((state) => {
    const records = Object.values(state.getRecords(network.tables.Tasks));
    records.sort((a, b) => Number(a.value.createdAt - b.value.createdAt));
    return records;
  });

  const buttonRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    console.log("mounting button");
    return mountButton(button, {
      wagmiConfig,
      accountKitConfig: {
        chain: networkConfig.chain,
        worldAddress: networkConfig.worldAddress,
        appInfo: {
          name: "Get Shit Done",
        },
        // erc4337: false,
      },
    });
  }, []);

  return (
    <>
      {appAccountClient ? (
        <button type="button" disabled>
          Signed in
        </button>
      ) : (
        <button type="button" onClick={openAccountModal} disabled={!openAccountModal}>
          Sign in
        </button>
      )}

      <span ref={buttonRef} />

      <table>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td align="right">
                <input
                  type="checkbox"
                  checked={task.value.completedAt > 0n}
                  title={task.value.completedAt === 0n ? "Mark task as completed" : "Mark task as incomplete"}
                  onChange={async (event) => {
                    event.preventDefault();
                    const checkbox = event.currentTarget;

                    checkbox.disabled = true;
                    try {
                      await systemCalls.toggleTask(task.key.id);
                    } finally {
                      checkbox.disabled = false;
                    }
                  }}
                />
              </td>
              <td>{task.value.completedAt > 0n ? <s>{task.value.description}</s> : <>{task.value.description}</>}</td>
              <td align="right">
                <button
                  type="button"
                  style={{ all: "unset" }}
                  title="Delete task"
                  onClick={async (event) => {
                    event.preventDefault();
                    if (!window.confirm("Are you sure you want to delete this task?")) return;

                    const button = event.currentTarget;
                    button.disabled = true;
                    try {
                      await systemCalls.deleteTask(task.key.id);
                    } finally {
                      button.disabled = false;
                    }
                  }}
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <input type="checkbox" disabled />
            </td>
            <td colSpan={2}>
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const fieldset = form.querySelector("fieldset");
                  if (!(fieldset instanceof HTMLFieldSetElement)) return;

                  const formData = new FormData(form);
                  const desc = formData.get("description");
                  if (typeof desc !== "string") return;

                  fieldset.disabled = true;
                  try {
                    await systemCalls.addTask(desc);
                    form.reset();
                  } finally {
                    fieldset.disabled = false;
                  }
                }}
              >
                <fieldset style={{ all: "unset" }}>
                  <input type="text" name="description" />{" "}
                  <button type="submit" title="Add task">
                    Add
                  </button>
                </fieldset>
              </form>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
};
