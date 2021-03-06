import { T } from './abi';
import { ERC1155, ERC20 } from './contracts';
import { EventType, Method, View } from './solidity';
import { verifyTypedDataV4 } from './typed-verify';
import { EIP1193Provider } from './eip1193';
import { AddEthereumChainParameter, Address, Block, BlockHash, BlockNumber, Call, CallData, ChainId, EIP712TypedDataDomain, Gas, InputBlockNumber, InputWei, LogFilter, LogItem, Transaction, TransactionReceipt, TxHash, TxIndex, Wei } from './types';
export { EIP1193Provider, Address, Block, BlockHash, BlockNumber, ChainId, Call, CallData, EIP712TypedDataDomain, Gas, InputBlockNumber, InputWei, LogFilter, LogItem, Transaction, TransactionReceipt, TxHash, TxIndex, Wei };
export { ERC1155, ERC20 };
export { verifyTypedDataV4 };
export { Method, View, EventType, T };
export default class Chain {
    private readonly provider;
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
    /**
     * Returns the currently configured chain ID, a value used in replay-protected transaction signing as introduced by EIP-155.
     * https://eips.ethereum.org/EIPS/eip-695
     */
    getChainId(): Promise<ChainId>;
    /**
     * https://eips.ethereum.org/EIPS/eip-3085
     */
    addEthereumChain(params: AddEthereumChainParameter): Promise<void>;
    /**
     * https://eips.ethereum.org/EIPS/eip-3326
     */
    switchEthereumChain(chainId: ChainId): Promise<void>;
}
