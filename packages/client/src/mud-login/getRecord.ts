import { Address, Hex, PublicClient, encodeAbiParameters } from "viem";
import { Schema, Table } from "@latticexyz/config";
import { decodeValueArgs, getKeySchema, getSchemaTypes, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { readContract } from "viem/actions";
import IStoreReadAbi from "@latticexyz/store/out/IStoreRead.sol/IStoreRead.abi.json";
import { AbiTypeToPrimitiveType } from "abitype";

type schemaToPrimitives<schema extends Schema> = {
  readonly [key in keyof schema]: AbiTypeToPrimitiveType<schema[key]["type"]>;
};

function encodeKeyTuple<keySchema extends Schema, key extends schemaToPrimitives<keySchema>>(
  keySchema: keySchema,
  key: key,
): Hex[] {
  return Object.keys(keySchema).map((name) => encodeAbiParameters([keySchema[name]], [key[name]]));
}

export type GetRecordOptions<table extends Table> = {
  storeAddress: Address;
  table: table;
  key: schemaToPrimitives<getKeySchema<table>>;
  blockTag?: "latest" | "pending";
};

export async function getRecord<table extends Table>(
  publicClient: PublicClient,
  { storeAddress, table, key, blockTag }: GetRecordOptions<table>,
): Promise<schemaToPrimitives<table["schema"]>> {
  const keyTuple = encodeKeyTuple(getKeySchema(table), key);

  const [staticData, encodedLengths, dynamicData] = await readContract(publicClient, {
    address: storeAddress,
    abi: IStoreReadAbi,
    functionName: "getRecord",
    args: [table.tableId, keyTuple],
    blockTag,
  });

  return {
    ...key,
    ...decodeValueArgs(getSchemaTypes(getValueSchema(table)), { staticData, encodedLengths, dynamicData }),
  };
}
