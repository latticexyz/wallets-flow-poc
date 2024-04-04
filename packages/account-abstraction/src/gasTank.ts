import worlds from "@latticexyz/gas-tank/internal/worlds.json";
import { Hex } from "viem";

export function getGasTankAddress(chainId: number): Hex | undefined {
  return worlds[chainId]?.address as never;
}
