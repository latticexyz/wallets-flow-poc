import { resourceToHex } from "@latticexyz/common";
import { Address, Hex, concatHex, encodeAbiParameters, hexToBigInt, keccak256, toBytes, toHex } from "viem";

export function getUserBalanceSlot(user: Address) {
  return getStaticDataLocation(resourceToHex({ type: "table", namespace: "", name: "UserBalances" }), [
    encodeAbiParameters([{ type: "address" }], [user]),
  ]);
}

// TODO: move this util to MUD (equivalent of StoreCore._getStaticDataLocation)
const SLOT = hexToBigInt(keccak256(toBytes("mud.store")));
function getStaticDataLocation(tableId: Hex, keyTuple: Hex[]): Hex {
  return toHex(SLOT ^ hexToBigInt(keccak256(concatHex([tableId, ...keyTuple]))));
}
