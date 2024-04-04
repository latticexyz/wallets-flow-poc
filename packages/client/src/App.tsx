import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getContract } from "viem";
import { LoginButton, useAppAccountClient } from "./mud-login";
import { useMUD } from "./MUDContext";
import { createSystemCalls } from "./mud/createSystemCalls";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { networkConfig, publicClient } from "./common";
import { useEffect } from "react";
import config from "contracts/mud.config";

const styleUnset = { all: "unset" } as const;

export const App = () => {
  const network = useMUD();
  const appAccountClient = useAppAccountClient();

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

  return (
    <>
      <LoginButton />

      <ConnectButton />

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
                  title="Delete task"
                  style={styleUnset}
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
                <fieldset style={styleUnset}>
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
