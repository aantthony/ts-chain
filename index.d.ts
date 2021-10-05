declare type TypedString<identifier> = string & {
    readonly __: unique symbol;
    readonly table: identifier;
};
/**
 * Checksummed address.
 *
 * All Addresses used and returned by ts-chain are checksummed. Therefore, it is safe to use a simple equality check.
 * To convert a string to an Address, use Address(str) which will ensure it is checksummed.
 */
export declare type Address = TypedString<'Address'>;
export declare type TxHash = TypedString<'Transaction'>;
export declare type BlockHash = TypedString<'BlockHash'>;
export declare type BlockNumber = bigint;
export declare function Address(hexString: string): Address;
export interface EIP712TypedDataDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: Address;
}
export declare const T: {
    address: "address";
    addressArray: "address[]";
    uint256Array: "uint256[]";
    stringArray: "string[]";
    string: "string";
    uint8: "uint8";
    uint16: "uint16";
    uint32: "uint32";
    uint64: "uint64";
    uint128: "uint128";
    uint256: "uint256";
    bytes32: "bytes32";
    uint: "uint";
    Array<X extends string>(x: X): `${X}[]`;
};
declare const Decoder: {
    uint(val: string): bigint;
    string(val: string): string;
    address(val: string): Address;
    'uint256[]'(val: string[]): bigint[];
    'address[]'(val: string[]): Address[];
    'string[]'(val: string[]): string[];
    uint8(val: string): bigint;
    uint16(val: string): bigint;
    uint32(val: string): bigint;
    uint64(val: string): bigint;
    uint128(val: string): bigint;
    uint256(val: string): bigint;
    bytes32(val: string): bigint;
    bool(val: boolean): boolean;
};
export declare type SolidityType = keyof typeof Decoder;
declare type DecodedType<T extends SolidityType> = ReturnType<typeof Decoder[T]>;
export declare type DecodedTuple<TupleType> = {
    [k in keyof TupleType]: TupleType[k] extends SolidityType ? DecodedType<TupleType[k]> : never;
};
export declare class CallData<ExpectedReturnType> {
    readonly data: string;
    readonly expectedResultType?: ExpectedReturnType | undefined;
    constructor(data: string, expectedResultType?: ExpectedReturnType | undefined);
}
export declare class EventFilter<ParamType> {
    readonly topics: string[];
    readonly params: ParamType;
    readonly index: (keyof ParamType)[];
    constructor(topics: string[], params: ParamType, index: (keyof ParamType)[]);
}
export declare type EventQuery<ParamType> = {
    [key in keyof ParamType]?: ParamType[key] extends SolidityType ? (DecodedType<ParamType[key]> | null) : never;
};
export interface EventType<ParamType> {
    (filter: EventQuery<ParamType>): EventFilter<ParamType>;
}
export declare function EventType<ParamType>(name: string, params: ParamType, index: (keyof ParamType)[]): EventType<ParamType>;
export declare function chainMethod<ArgType, ResultType>(methodName: string, argTypes: ArgType, resultType?: ResultType): (arg: DecodedTuple<ArgType>) => CallData<ResultType>;
interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}
export interface EIP1193Provider {
    request(args: RequestArguments): Promise<unknown>;
}
interface RawLogEvent {
    removed: false;
    logIndex: string;
    transactionIndex: string;
    transactionHash: string;
    blockHash: string;
    blockNumber: string;
    address: string;
    data: string;
    topics: [string, string, string, string];
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
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    blockNumber: string;
    from: string;
    to: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    contractAddress: null;
    logs: RawLogEvent[];
    logsBloom: string;
    type: '0x1' | '0x2';
    status: '0x1';
    effectiveGasPrice: string;
}
export declare type LogEntryForEventType<T> = T extends EventType<infer O> ? LogEntry<DecodedTuple<O>> : never;
export declare function verifyTypedDataV4(domain: EIP712TypedDataDomain, types: any, value: any, signature: string): Address;
export default class Chain {
    private readonly provider;
    readonly id: number;
    constructor(provider: EIP1193Provider);
    static create(provider: EIP1193Provider): Chain;
    static fromSendProvider(provider: {
        send(method: any, params: any): Promise<any>;
    }): Chain;
    rpc(method: string, params: readonly unknown[]): Promise<any>;
    signedTypedDataV4<T extends object>(account: Address, domain: EIP712TypedDataDomain, types: T, message: object, primaryType: keyof T): Promise<string>;
    getBlockNumber(): Promise<BlockNumber>;
    getAccounts(): Promise<Address[]>;
    getBalance(accounts: Address[]): Promise<bigint>;
    getTransaction(logEntry: {
        blockHash: BlockHash;
        txIndex: string;
    }): Promise<any>;
    logs<O>(event: EventFilter<O>, filter: {
        address: Address | null;
        fromBlock: BlockNumber | 'earliest' | 'latest';
        toBlock: BlockNumber | 'latest';
    }): Promise<LogEntry<DecodedTuple<O>>[]>;
    getTransactionReceipt(tx: TxHash): Promise<RawTransactionReceipt | null>;
    call<ResultType>(to: Address, callData: CallData<ResultType>): Promise<DecodedTuple<ResultType>>;
    transact(to: Address, callData: CallData<unknown>, params: {
        from?: Address;
        value?: bigint;
        gas?: bigint;
        gasPrice?: bigint;
    }): Promise<TxHash>;
}
export {};
