import { defaultAbiCoder } from '@ethersproject/abi';
import { verifyTypedData } from '@ethersproject/wallet';
import { getAddress } from '@ethersproject/address';
import { hexConcat } from '@ethersproject/bytes';
import { keccak_256 } from 'js-sha3';

type TypedString<identifier> = string & {
  readonly __: unique symbol;
  readonly table: identifier;
}

/**
 * Checksummed address.
 * 
 * All Addresses used and returned by ts-chain are checksummed. Therefore, it is safe to use a simple equality check.
 * To convert a string to an Address, use Address(str) which will ensure it is checksummed.
 */
export type Address = TypedString<'Address'>;

export type TxHash = TypedString<'Transaction'>;
export type BlockHash = TypedString<'BlockHash'>;
export type BlockNumber = bigint;

export function Address(hexString: string) {
  return getAddress(hexString) as Address;
}

export interface EIP712TypedDataDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Address;
}

export const T = {
  address: 'address' as 'address',
  addressArray: 'address[]' as 'address[]',
  uint256Array: 'uint256[]' as 'uint256[]',
  stringArray: 'string[]' as 'string[]',
  string: 'string' as 'string',
  uint8: 'uint8' as 'uint8',
  uint16: 'uint16' as 'uint16',
  uint32: 'uint32' as 'uint32',
  uint64: 'uint64' as 'uint64',
  uint128: 'uint128' as 'uint128',
  uint256: 'uint256' as 'uint256',
  bytes32: 'bytes32' as 'bytes32',
  uint: 'uint' as 'uint',
  Array<X extends string>(x: X): `${X}[]` {
    return `${x}[]`;
  }
};

const Decoder = {
  uint(val: string): bigint { return BigInt(val); },
  string(val: string): string { return val; },
  address(val: string): Address { return Address(val); },
  'uint256[]'(val: string[]): bigint[] { return val.map(v => (BigInt(v))); },
  'address[]'(val: string[]): Address[] { return val.map(v => Address(v)); },
  'string[]'(val: string[]): string[] { return val; },
  uint8(val: string): bigint { return BigInt(val); },
  uint16(val: string): bigint { return BigInt(val); },
  uint32(val: string): bigint { return BigInt(val); },
  uint64(val: string): bigint { return BigInt(val); },
  uint128(val: string): bigint { return BigInt(val); },
  uint256(val: string): bigint { return BigInt(val); },
  bytes32(val: string): bigint { return BigInt(val); },
  bool(val: boolean): boolean {
    if (val === true) return true;
    if (val === false) return false;
    throw new Error(`Unknown boolean: ${val}`);
  },
};

export type SolidityType = keyof typeof Decoder;

type DecodedType<T extends SolidityType> = ReturnType<typeof Decoder[T]>;

export type DecodedTuple<TupleType> = {
  [k in keyof TupleType]: TupleType[k] extends SolidityType ? DecodedType<TupleType[k]> : never;
}

export class CallData<ExpectedReturnType> {
  constructor(public readonly data: string, public readonly expectedResultType?: ExpectedReturnType) {
  }
}
export class EventFilter<ParamType> {
  constructor(public readonly topics: string[], public readonly params: ParamType, public readonly index: (keyof ParamType)[]) {
  }
}

function buildCompactCallName(name: string, argTypes: string[]) {
  return `${name}(${argTypes.join(',')})`;
}

function callSig(name: string) {
  return '0x' + keccak_256(name).substring(0, 8);
}

function eventSig(name: string, argTypes: string[]) {
  const n = `${name}(${argTypes.join(',')})`;
  return '0x' + keccak_256(n);
}

function assertString(val: unknown, forField: string): string {
  if (typeof val === 'string') return val;
  throw new Error(`Expected string for ${forField}, got ${val}`);
}

function encode(value: any, t: string): any {
  if (Array.isArray(value)) return value.map(e => encode(e, '?'));
  return value;
}

function encodeArgData(argTypes: any, arg: any): string {
  const typesArray: string[] = [];
  const valuesArray: any[] = [];

  Object.keys(argTypes)
  .forEach(k => {
    const t = (argTypes as any)[k];
    typesArray.push(t);
    valuesArray.push(encode((arg as any)[k], t));
  });

  return defaultAbiCoder.encode(typesArray, valuesArray);
}

export type EventQuery<ParamType> = {
  [key in keyof ParamType]?: ParamType[key] extends SolidityType ? (DecodedType<ParamType[key]> | null) : never;
}

export interface EventType<ParamType> {
  (filter: EventQuery<ParamType>): EventFilter<ParamType>;
}

export function EventType<ParamType>(name: string, params: ParamType, index: (keyof ParamType)[]): EventType<ParamType> {
  let topic0: string | null = null;
  return function (filter: EventQuery<ParamType>): EventFilter<ParamType> {
    topic0 = topic0 || eventSig(name, Object.keys(params).map(k => (params as any)[k]));
    const retValue = [topic0];
    Object.keys(filter).forEach(k => {
      const indexPos = index.indexOf(k as any);
      if (indexPos === -1) throw new Error(`Cannot filter on "${k}" as it is not an indexed event parameter.`);
      const t: string = (params as any)[k];
      const v: any = encode((filter as any)[k], t);
      retValue[indexPos + 1] = defaultAbiCoder.encode([t], [v]);
    });

    return new EventFilter(retValue, params, index);
  }
}

export function chainMethod<ArgType, ResultType>(
  methodName: string,
  argTypes: ArgType,
  resultType?: ResultType
): (arg: DecodedTuple<ArgType>) => CallData<ResultType> {
  let sig: string | null = null;
  return function getCallData(arg): CallData<ResultType> {
    sig = sig || callSig(
      buildCompactCallName(
        methodName,
        Object.keys(argTypes).map(n => assertString((argTypes as any)[n], `argTypes[${n}] in ${methodName} definition`))
      )
    );

    const argData = encodeArgData(argTypes, arg);
    const allData = hexConcat([sig, argData]);
    return new CallData(allData, resultType);
  }
}

function decodeValue(val: any, type: string): any {
  if (val.toBigInt) {
    return val.toBigInt();
  }

  const dec = (Decoder as any)[type];
  if (!dec) throw new Error(`Cannot decode ${type}.`)

  return (Decoder as any)[type](val);
}

function decodeObject<ResultType>(returnTypeObject: ResultType, dataString: string): DecodedTuple<ResultType> {
  const typesArray: string[] = [];
  const rTypeObj = returnTypeObject as any;

  const repsonseKeys: string[] = Object.keys(rTypeObj);

  repsonseKeys.forEach(k => {
    const v = rTypeObj[k];
    typesArray.push(v);
    repsonseKeys.push(k);
  });

  const rObj = defaultAbiCoder.decode(typesArray, dataString);

  const retValue: any = {};
  rObj.forEach((item, index) => {
    const t = typesArray[index];
    retValue[repsonseKeys[index]] = decodeValue(item, t);
  });

  return retValue;
}

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface EIP1193Provider {
  request(args: RequestArguments): Promise<unknown>;
}

interface RawLogEvent {
  removed: false,
  logIndex: string,
  transactionIndex: string,
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
  address: string;
  data: string;
  topics: [string, string, string, string]
}

export interface LogEntry<ParamType> {
  address: Address;
  params: ParamType;
  blockHash: BlockHash;
  blockNumber: BlockNumber;
  tx: TxHash;
  txIndex: bigint;
}

export interface RawTransactionReceipt {
  transactionHash:string,
  transactionIndex:string,
  blockHash:string,
  blockNumber: string,
  from: string;
  to: string;
  cumulativeGasUsed:string;
  gasUsed: string;
  contractAddress:null;
  logs: RawLogEvent[];
  logsBloom: string;
  type: '0x1' | '0x2';
  status: '0x1';
  effectiveGasPrice: string;
};

function toJson(obj: any): any {
  if (typeof obj === 'bigint') return `0x${obj.toString(16)}`;
  if (Array.isArray(obj)) return obj.map(toJson);
  if (typeof obj === 'object') {
    const res: any = {};
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (v !== undefined) {
        res[k] = toJson(v);
      }
    });
    return res;
  }

  if (typeof obj === 'string') return obj;
  throw new Error('could not encode');
}

export type LogEntryForEventType<T> = T extends EventType<infer O> ? LogEntry< DecodedTuple<O>> : never;

export function verifyTypedDataV4(domain: EIP712TypedDataDomain, types: any, value: any, signature: string): Address {
  const addr = verifyTypedData({
    name: domain.name,
    version: domain.version,
    chainId: domain.chainId,
    verifyingContract: domain.verifyingContract,
  }, types, value, signature);
  return addr as Address;
}

export default class Chain {
  public readonly id: number;
  constructor(private readonly provider: EIP1193Provider) {
    if (!provider) throw new Error('missing provider in Chain constructor');
    const c = (provider as any).chainId;
    this.id = typeof c === 'number' ? c : parseInt(c);
  }

  static create(provider: EIP1193Provider) {
    return new Chain(provider);
  }

  static fromSendProvider(provider: { send(method: any, params: any): Promise<any> }) {
    return new Chain({
      async request({method, params}) {
        return provider.send(method, params as any);
      }
    });
  }

  async rpc(method: string, params: readonly unknown[]): Promise<any> {
    if (params.length === undefined) throw new Error('invalid params array');
    // console.info(`ETH: ${method}(${params.map(e => JSON.stringify(e)).join(', ')})`);
    const json = toJson(params);
    const res = await this.provider.request({ method, params: json });
    // console.info(`ETH: ${method}(${params.map(e => JSON.stringify(e)).join(', ')})`, `${JSON.stringify(res)}`);
    return res;
  }

  async signedTypedDataV4<T extends object>(
    account: Address,
    domain: EIP712TypedDataDomain,
    types: T,
    message: object,
    primaryType: keyof T
  ): Promise<string> {
    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];

    const req = {
      domain,
      types: {
        EIP712Domain,
        ...types,
      },
      message,
      primaryType,
    };

    return this.rpc('eth_signTypedData_v4', [
      account,
      JSON.stringify(req),
    ]);
  }

  async getBlockNumber(): Promise<BlockNumber> {
    const s = await this.rpc('eth_blockNumber', []);
    return BigInt(s);
  }

  async getAccounts(): Promise<Address[]> {
    return this.rpc('eth_accounts', []);
  }

  async getBalance(accounts: Address[]): Promise<bigint> {
    const resData: string = await this.rpc('eth_getBalance', [...accounts, 'latest']);
    return BigInt(resData);
  }

  async getTransaction(logEntry: {
    blockHash: BlockHash;
    txIndex: string;
  }) {
    return this.rpc('eth_getTransactionByBlockHashAndIndex', [
      logEntry.blockHash,
      logEntry.txIndex,
    ]);
  }

  async logs<O>(
    event: EventFilter<O>,
    filter: {
      address: Address | null,
      fromBlock: BlockNumber | 'earliest' | 'latest',
      toBlock: BlockNumber | 'latest',
    }
  ): Promise<LogEntry<DecodedTuple<O>>[]> {
    const results: RawLogEvent[] = await this.rpc('eth_getLogs', [
      {
        fromBlock: filter.fromBlock,
        toBlock: filter.toBlock,
        address: filter.address,
        topics: event.topics,
      },
    ]);

    return results.map((log): LogEntry<DecodedTuple<O>> => {
      const res: any = {};
      const dataNamesArray = Object.keys(event.params).filter(k => {
        return event.index.indexOf(k as any) === -1;
      });
      const dataTypesArray = dataNamesArray.map(n => (event.params as any)[n]);
      const arrayObj = log.data !== '0x' ? defaultAbiCoder.decode(dataTypesArray, log.data) : [];
      arrayObj.forEach((val, i) => {
        const t = dataTypesArray[i];
        res[dataNamesArray[i]] = decodeValue(val, t);
      });

      const indexedNames = Object.keys(event.params).filter(k => {
        return event.index.indexOf(k as any) !== -1;
      });
      indexedNames.forEach((n, i) => {
        const rawVal = log.topics[i + 1];
        const t = (event.params as any)[n];
        const [v] = defaultAbiCoder.decode([t], rawVal);
        res[n] = decodeValue(v, t);
      });

      return {
        address: log.address as Address,
        blockHash: log.blockHash as BlockHash,
        blockNumber: BigInt(log.blockNumber),
        tx: log.transactionHash as TxHash,
        txIndex: BigInt(log.transactionIndex),
        params: res,
      }
    });
  }
  
  async getTransactionReceipt(tx: TxHash): Promise<RawTransactionReceipt | null> {
    return this.rpc('eth_getTransactionReceipt', [tx]);
  }

  async call<ResultType>(to: Address, callData: CallData<ResultType>): Promise<DecodedTuple<ResultType>> {
    const rString: string = await this.rpc('eth_call', [{ to, data: callData.data }, 'latest']);
    return decodeObject(callData.expectedResultType!, rString);
  }

  async transact(to: Address, callData: CallData<unknown>, params: { from?: Address, value?: bigint, gas?: bigint, gasPrice?: bigint }): Promise<TxHash> {
    const tx = {
      from: params.from,
      to,
      gas: params.gas,
      gasPrice: params.gasPrice,
      value: params.value || 0n,
      data: callData.data,
    };
    return this.rpc('eth_sendTransaction', [tx]);
  }
}
