import { resourceToHex } from "@latticexyz/common";
import { Address, Hex, concatHex, hexToBigInt, keccak256, padHex, toBytes, toHex } from "viem";

export function getUserBalanceSlot(user: Address) {
  return _getStaticDataLocation(resourceToHex({ type: "table", namespace: "", name: "UserBalances" }), [
    padHex(user, { dir: "left", size: 32 }),
  ]);
}

// TODO: move to MUD

const SLOT = hexToBigInt(keccak256(toBytes("mud.store")));

function _getStaticDataLocation(tableId: Hex, keyTuple: Hex[]): Hex {
  return toHex(SLOT ^ hexToBigInt(keccak256(concatHex([tableId, ...keyTuple]))));
}
