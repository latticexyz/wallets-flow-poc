import worlds from "@latticexyz/gas-tank/internal/worlds.json";
import { Hex, isHex } from "viem";

export function getGasTankAddress(chainId: number): Hex | undefined {
  const params = new URLSearchParams(window.location.search);
  const gasTank = worlds[chainId];
  const gasTankAddress = params.get("gasTankAddress") || gasTank?.address;
  if (!gasTankAddress) {
    throw new Error(`No gas tank address found for chain ${chainId}. Did you run \`mud deploy\`?`);
  }

  if (!isHex(gasTankAddress)) {
    throw new Error(`Invalid gas tnk address: ${gasTankAddress}`);
  }

  return gasTankAddress;
}
