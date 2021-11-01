declare type Hex<identifier> = `0x${string}` & {
    readonly __: unique symbol;
    readonly table: identifier;
};
/**
 * Lowercase address.
 *
 * All Addresses used and returned by ts-chain are lowercase. Therefore, it is safe to use a simple equality check.
 * To convert a string to an Address, use Address(str).
 */
export declare type Address = Hex<'Address'>;
export declare function Address(hexString: string): Address;
export declare type Data = Hex<'Data'>;
export declare type CallData = Hex<'CallData'>;
export declare type TxIndex = Hex<'TransactionIndex'>;
export declare type TxHash = Hex<'Transaction'>;
export declare type TxNonce = Hex<'TxNonce'>;
export declare type BlockHash = Hex<'BlockHash'>;
export declare type BlockNumber = Hex<'BlockNumber'>;
export declare type L1BlockNumber = Hex<'L1BlockNumber'>;
export declare type Gas = Hex<'Gas'>;
export declare type Wei = Hex<'Wei'>;
export declare type Timestamp = Hex<'Timestamp'>;
export declare type SigR = Hex<'R'>;
export declare type SigS = Hex<'S'>;
export declare type SigV = Hex<'V'>;
export declare type LogTopic = Hex<'LogTopic'>;
export declare type LogFilter = (LogTopic | LogTopic[] | null)[];
export interface LogItem {
    removed: boolean;
    logIndex: Hex<'LogIndex'>;
    transactionIndex: TxIndex;
    transactionHash: TxHash;
    blockHash: BlockHash;
    blockNumber: BlockNumber;
    address: Address;
    data: Data;
    topics: LogTopic[];
}
export interface Transaction {
    blockHash: BlockHash;
    blockNumber: BlockNumber;
    from: Address;
    gas: Gas;
    gasPrice: Wei;
    hash: TxHash;
    index: TxIndex;
    input: CallData;
    l1BlockNumber?: L1BlockNumber;
    l1Timestamp?: Timestamp;
    l1TxOrigin?: null;
    nonce: TxNonce;
    queueIndex?: null;
    queueOrigin?: 'sequencer';
    r: SigR;
    rawTransaction: Hex<'RawTransaction'>;
    s: SigS;
    to: Address;
    transactionIndex: TxIndex;
    txType: '';
    v: SigV;
    value: Wei;
}
export declare type LogsBloom = Hex<'LogsBloom'>;
export interface Block<T> {
    difficulty: Hex<'Difficulty'>;
    extraData: Hex<'extraData'>;
    gasLimit: Gas;
    gasUsed: Gas;
    hash: BlockHash;
    logsBloom: LogsBloom;
    miner: Address;
    mixHash: Hex<'MixHash'>;
    nonce: Hex<'Nonce'>;
    number: string | BlockNumber;
    parentHash: BlockHash;
    receiptsRoot: Hex<'ReceiptsRoot'>;
    sha3Uncles: Hex<'Sha3Uncles'>;
    size: Hex<'BlockSize'>;
    stateRoot: Hex<'StateRoot'>;
    timestamp: Timestamp;
    totalDifficulty: Hex<'TotalDifficulty'>;
    transactionsRoot: Hex<'TransactionsRoot'>;
    uncles: unknown[];
    transactions: T[];
}
export declare type InputBlockNumber = BlockNumber | bigint | number;
export declare type InputWei = Wei | bigint;
export interface Call<Result> {
    data: CallData;
    decode(data: Data): Result;
}
export interface EIP712TypedDataDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: Address;
}
interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}
export interface EIP1193Provider {
    request(args: RequestArguments): Promise<unknown>;
}
export interface TransactionReceipt {
    transactionHash: TxHash;
    transactionIndex: TxIndex;
    blockHash: BlockHash;
    blockNumber: BlockNumber;
    from: Address;
    to: Address;
    cumulativeGasUsed: Gas;
    gasUsed: Gas;
    contractAddress: Address | null;
    logs: LogItem[];
    logsBloom: LogsBloom;
    type: '0x1' | '0x2';
    status: '0x1';
    effectiveGasPrice: Wei;
}
export {};
