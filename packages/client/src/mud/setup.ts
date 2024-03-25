/*
 * This file sets up all the definitions required for a MUD client.
 */

import { createSystemCalls } from "./createSystemCalls";
import { setupDevTools } from "./setupDevTools";
import { setupNetwork } from "./setupNetwork";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  const network = await setupNetwork();
  const systemCalls = createSystemCalls(network);
  setupDevTools(network);

  return {
    network,
    systemCalls,
  };
}
