import { defaultAbiCoder } from '@ethersproject/abi';
import { Data, Address, LogTopic, TxHash, TxIndex } from './types';

export const T = {
  address: 'address' as 'address',
  addressArray: 'address[]' as 'address[]',
  uint16Array: 'uint16[]' as 'uint16[]',
  uint256Array: 'uint256[]' as 'uint256[]',
  stringArray: 'string[]' as 'string[]',
  string: 'string' as 'string',

  uint8: 'uint8' as 'uint8',
  uint16: 'uint16' as 'uint16',
  uint32: 'uint32' as 'uint32',
  uint48: 'uint48' as 'uint48',
  uint64: 'uint64' as 'uint64',
  uint128: 'uint128' as 'uint128',
  uint256: 'uint256' as 'uint256',

  int8: 'int8' as 'int8',
  int16: 'int16' as 'int16',
  int32: 'int32' as 'int32',
  int48: 'int48' as 'int48',
  int64: 'int64' as 'int64',
  int128: 'int128' as 'int128',
  int256: 'int256' as 'int256',

  bytes32: 'bytes32' as 'bytes32',


  // Shorthand for uint256
  uint: 'uint256' as 'uint256',
  Array<X extends string>(x: X): `${X}[]` {
    return `${x}[]`;
  }
};

function toBigInt(val: string): bigint {
  return BigInt(val);
}

const Decoder = {
  string(val: string): string { return val; },
  address(val: string): Address { return Address(val); },
  'uint16[]'(val: string[]): bigint[] { return val.map(v => (BigInt(v))); },
  'uint256[]'(val: string[]): bigint[] { return val.map(v => (BigInt(v))); },
  'address[]'(val: string[]): Address[] { return val.map(v => Address(v)); },
  'string[]'(val: string[]): string[] { return val; },
  uint8: toBigInt,
  uint16: toBigInt,
  uint32: toBigInt,
  uint48: toBigInt,
  uint64: toBigInt,
  uint128: toBigInt,
  uint256: toBigInt,
  bytes32: toBigInt,
  bool(val: boolean): boolean {
    if (val === true) return true;
    if (val === false) return false;
    throw new Error(`Unknown boolean: ${val}`);
  },
};

export type AbiType = keyof typeof Decoder;

export type DecodedType<T extends AbiType> = ReturnType<typeof Decoder[T]>;

export type DecodedTuple<TupleType> = {
  [k in keyof TupleType]: TupleType[k] extends AbiType ? DecodedType<TupleType[k]> : never;
}

function abiEncode<T extends AbiType[]>(types: T, values: DecodedTuple<T>): Data {
  return defaultAbiCoder.encode(types, values) as Data;
}

function normalize(val: any, type: AbiType): any {
  if (val.toBigInt) {
    return val.toBigInt();
  }

  const dec = (Decoder as any)[type];
  if (!dec) throw new Error(`Cannot decode ${type}.`)

  return (Decoder as any)[type](val);
}

export function abiDecode<T extends AbiType[]>(types: T, data: Data): any[] {
  return defaultAbiCoder.decode(types, data).map((d, i) => normalize(d, types[i])) as any;
}

export function decodeObject<Spec>(spec: Spec, data: Data): DecodedTuple<Spec> {
  const typesArray: AbiType[] = [];
  const rTypeObj = spec as any;

  const repsonseKeys: string[] = Object.keys(rTypeObj);

  repsonseKeys.forEach(k => {
    const v = rTypeObj[k];
    typesArray.push(v);
    repsonseKeys.push(k);
  });

  const rArray = abiDecode(typesArray, data);

  const retValue: any = {};
  rArray.forEach((item, index) => {
    const t = typesArray[index];
    retValue[repsonseKeys[index]] = normalize(item, t);
  });

  return retValue;
}

export function encodeObject<Spec>(spec: Spec, value: DecodedTuple<Spec>): Data {
  const typesArray: AbiType[] = [];
  const valuesArray: any[] = [];

  Object.keys(spec)
  .forEach(k => {
    const t = (spec as any)[k];
    typesArray.push(t);
    valuesArray.push((value as any)[k]);
  });

  return abiEncode(typesArray, valuesArray);
}


export function encodeTopic<T extends AbiType>(t: T, v: DecodedType<T>): LogTopic {
  return abiEncode([t], [v as any]) as string as LogTopic;
}
