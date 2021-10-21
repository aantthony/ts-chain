type Hex<identifier> = `0x${string}` & {
  readonly __: unique symbol;
  readonly table: identifier;
}

/**
 * Lowercase address.
 * 
 * All Addresses used and returned by ts-chain are lowercase. Therefore, it is safe to use a simple equality check.
 * To convert a string to an Address, use Address(str).
 */
export type Address = Hex<'Address'>;

export function Address(hexString: string) {
  return hexString.toLowerCase() as Address;
}

export type Data = Hex<'Data'>;

export type CallData = Hex<'CallData'>;
export type TxIndex = Hex<'TransactionIndex'>;
export type TxHash = Hex<'Transaction'>;
export type TxNonce = Hex<'TxNonce'>;
export type BlockHash = Hex<'BlockHash'>;
export type BlockNumber = Hex<'BlockNumber'>;

export type L1BlockNumber = Hex<'L1BlockNumber'>;

export type Gas = Hex<'Gas'>;
export type Wei = Hex<'Wei'>;

export type Timestamp = Hex<'Timestamp'>;

export type SigR = Hex<'R'>;
export type SigS = Hex<'S'>;
export type SigV = Hex<'V'>;

export type LogTopic = Hex<'LogTopic'>;

export type LogFilter = (LogTopic | LogTopic[] | null)[];

export interface LogItem {
  removed: boolean,
  logIndex: Hex<'LogIndex'>,
  transactionIndex: TxIndex,
  transactionHash: TxHash;
  blockHash: BlockHash;
  blockNumber: BlockNumber;
  address: Address;
  data: Data;
  topics: LogTopic[];
}

export interface Transaction {
  blockHash: BlockHash,
  blockNumber: BlockNumber,
  from: Address,
  gas: Gas,
  gasPrice: Wei,
  hash: TxHash,
  index: TxIndex,
  input: CallData,
  l1BlockNumber?: L1BlockNumber,
  l1Timestamp?: Timestamp,
  l1TxOrigin?: null,
  nonce: TxNonce,
  queueIndex?: null,
  queueOrigin?: 'sequencer',
  r: SigR,
  rawTransaction: Hex<'RawTransaction'>,
  s: SigS,
  to: Address,
  transactionIndex: TxIndex,
  txType: '',
  v: SigV,
  value: Wei,
};

export type LogsBloom = Hex<'LogsBloom'>;

export interface Block<T> {
  difficulty: Hex<'Difficulty'>,
  extraData: Hex<'extraData'>,
  gasLimit: Gas,
  gasUsed: Gas,
  hash: BlockHash,
  logsBloom: LogsBloom,
  miner: Address,
  mixHash: Hex<'MixHash'>,
  nonce: Hex<'Nonce'>,
  number: string | BlockNumber,
  parentHash: BlockHash,
  receiptsRoot: Hex<'ReceiptsRoot'>,
  sha3Uncles: Hex<'Sha3Uncles'>,
  size: Hex<'BlockSize'>,
  stateRoot: Hex<'StateRoot'>,
  timestamp: Timestamp,
  totalDifficulty: Hex<'TotalDifficulty'>,
  transactionsRoot: Hex<'TransactionsRoot'>,
  uncles: unknown[];

  transactions: T[];
}

export type InputBlockNumber = BlockNumber | bigint | number;
export type InputWei = Wei | bigint;

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
  transactionHash: TxHash,
  transactionIndex: TxIndex,
  blockHash: BlockHash,
  blockNumber: BlockNumber,
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
};

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
    data: CallData,
    from?: Address
    value?: InputWei,
    gas?: Gas,
    gasPrice?: InputWei;
  }): Promise<TxHash> {
    params.value = params.value || 0n;
    return this.rpc('eth_sendTransaction', [params]);
  }
}
