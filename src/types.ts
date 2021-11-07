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

export type ChainId = Hex<'ChainId'>;
export function ChainId(hexStringOrNumber: string | number): ChainId {
  if (typeof hexStringOrNumber === 'number') {
    return '0x' + hexStringOrNumber.toString(16) as ChainId;
  }
  return hexStringOrNumber.toLowerCase() as ChainId;
}

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
  chainId: ChainId;
  verifyingContract: Address;
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

export interface AddEthereumChainParameter {
  chainId: ChainId;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
}
