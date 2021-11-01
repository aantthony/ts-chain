import { T } from './abi';
import { ERC1155, ERC20 } from './contracts';
import { EventType, Method, View } from './solidity';
import { verifyTypedDataV4 } from './typed-verify';
import { Address, Block, BlockHash, BlockNumber, Call, CallData, EIP1193Provider, EIP712TypedDataDomain, Gas, InputBlockNumber, InputWei, LogFilter, LogItem, Transaction, TransactionReceipt, TxHash, TxIndex, Wei } from './types';
export { Address, Block, BlockHash, BlockNumber, Call, CallData, EIP1193Provider, EIP712TypedDataDomain, Gas, InputBlockNumber, InputWei, LogFilter, LogItem, Transaction, TransactionReceipt, TxHash, TxIndex, Wei };
export { ERC1155, ERC20 };
export { verifyTypedDataV4 };
export { Method, View, EventType, T };
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
    getBlockByHash<T extends boolean>(blockHash: BlockHash, includeTransactions: T): Promise<Block<T extends true ? Transaction : TxHash>>;
    getBlockByNumber<T extends boolean>(n: InputBlockNumber, includeTransactions: T): Promise<Block<T extends true ? Transaction : TxHash>>;
    getAccounts(): Promise<Address[]>;
    getBalance(accounts: Address[]): Promise<Wei>;
    getTransaction(logEntry: {
        blockHash: BlockHash;
        txIndex: TxIndex;
    }): Promise<Transaction>;
    getLogs(params: {
        fromBlock: InputBlockNumber | 'earliest' | 'latest';
        toBlock: InputBlockNumber | 'latest';
        address: Address | null;
        topics: LogFilter;
    }): Promise<LogItem[]>;
    getTransactionReceipt(tx: TxHash): Promise<TransactionReceipt | null>;
    call<T>(to: Address, call: Call<T> | CallData): Promise<T>;
    transact(params: {
        to: Address;
        data: Call<void> | CallData;
        from?: Address;
        value?: InputWei;
        gas?: Gas;
        gasPrice?: InputWei;
    }): Promise<TxHash>;
}
