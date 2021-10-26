import { T } from './abi';
import { ERC1155, ERC20 } from './contracts';
import { EventType, Method, View } from './solidity';
import { verifyTypedDataV4 } from './typed-verify';
import { Address, Block, BlockHash, BlockNumber, Call, CallData, EIP1193Provider, EIP712TypedDataDomain, Gas, InputBlockNumber, InputWei, LogFilter, LogItem, Transaction, TransactionReceipt, TxHash, TxIndex, Wei } from './types';

export { Address, Block, BlockHash, BlockNumber, Call, CallData, EIP1193Provider, EIP712TypedDataDomain, Gas, InputBlockNumber, InputWei, LogFilter, LogItem, Transaction, TransactionReceipt, TxHash, TxIndex, Wei };

export { ERC1155, ERC20 };

export { verifyTypedDataV4 };

export { Method, View, EventType, T };

function toJson(obj: any): any {
  if (typeof obj === 'bigint') return `0x${obj.toString(16)}`;
  if (Array.isArray(obj)) return obj.map(toJson);
  if (obj === null) return null;
  if (typeof obj === 'boolean') return obj;
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
  throw new Error(`could not encode ${typeof obj}`);
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
    return this.rpc('eth_blockNumber', []);
  }

  async getBlockByHash<T extends boolean>(blockHash: BlockHash, includeTransactions: T): Promise<
    Block<T extends true ? Transaction : TxHash>
  > {
    return this.rpc('eth_getBlockByHash', [blockHash, includeTransactions]);
  }

  async getBlockByNumber<T extends boolean>(n: InputBlockNumber, includeTransactions: T): Promise<
    Block<T extends true ? Transaction : TxHash>
  > {
    return this.rpc('eth_getBlockByNumber', [n, includeTransactions]);
  }

  async getAccounts(): Promise<Address[]> {
    return this.rpc('eth_accounts', []);
  }

  async getBalance(accounts: Address[]): Promise<Wei> {
    return this.rpc('eth_getBalance', [...accounts, 'latest']);
  }

  async getTransaction(logEntry: { blockHash: BlockHash; txIndex: TxIndex }): Promise<Transaction> {
    return this.rpc('eth_getTransactionByBlockHashAndIndex', [ logEntry.blockHash, logEntry.txIndex ]);
  }

  async getLogs(params: {
    fromBlock: InputBlockNumber | 'earliest' | 'latest',
    toBlock: InputBlockNumber | 'latest',
    address: Address | null;
    topics: LogFilter;
  }): Promise<LogItem[]> {
    return this.rpc('eth_getLogs', [params]);
  }
  
  async getTransactionReceipt(tx: TxHash): Promise<TransactionReceipt | null> {
    return this.rpc('eth_getTransactionReceipt', [tx]);
  }

  async call<T>(to: Address, call: Call<T> | CallData): Promise<T> {
    const hasDecoder = typeof call === 'object';
    const data = hasDecoder ? call.data : call;
    const result = await this.rpc('eth_call', [{ to, data }, 'latest']);
    return hasDecoder ? call.decode(result) : result;
  }

  async transact(params: {
    to: Address,
    data: Call<void> | CallData,
    from?: Address
    value?: InputWei,
    gas?: Gas,
    gasPrice?: InputWei;
  }): Promise<TxHash> {
    params.value = params.value || 0n;
    if (typeof params.data === 'object') {
      params.data = params.data.data;
    }
    return this.rpc('eth_sendTransaction', [params]);
  }
}
