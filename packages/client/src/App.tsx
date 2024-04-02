import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletClient } from "wagmi";
import { Hex } from "viem";
import LatticeKitDialog from "./lattice-kit/Dialog";
import { useMUD } from "./mud/mudStore";
import { LoginButton } from "./mud-login";

const styleUnset = { all: "unset" } as const;

export const App = () => {
  const state = useMUD();
  const mainWallet = useWalletClient();
  const {
    network: { useStore, tables },
  } = state;

  const tasks = useStore((state) => {
    const records = Object.values(state.getRecords(tables.Tasks));
    records.sort((a, b) => Number(a.value.createdAt - b.value.createdAt));
    return records;
  });

  function handleToggle(id: Hex) {
    if (state.status === "write") {
      return state.systemCalls.toggleTask(id);
    }
  }

  function handleDelete(id: Hex) {
    if (state.status === "write") {
      return state.systemCalls.deleteTask(id);
    }
  }

  function handleAdd(id: string) {
    if (state.status === "write") {
      return state.systemCalls.addTask(id);
    }
  }

  return (
    <>
      <LoginButton />

      <ConnectButton />
      {mainWallet && <LatticeKitDialog />}

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
                      await handleToggle(task.key.id);
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
                      await handleDelete(task.key.id);
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
                    await handleAdd(desc);
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
