export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}
export interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}
export interface EthSubscription extends ProviderMessage {
  readonly type: 'eth_subscription';
  readonly data: {
      readonly subscription: string;
      readonly result: unknown;
  };
}
interface ProviderConnectInfo {
  readonly chainId: string;
}
export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}
export interface SimpleEventEmitter {
  on(event: string, listener: any): void;
  once(event: string, listener: any): void;
  removeListener(event: string, listener: any): void;
  off(event: string, listener: any): void;
}
export interface EIP1193Provider extends SimpleEventEmitter {
  request(args: RequestArguments): Promise<unknown>;
  on(eventName: 'connect', listener: (connectInfo: ProviderConnectInfo) => void): this | void;
  on(eventName: 'disconnect', listener: (error: ProviderRpcError) => void): this | void;
  on(eventName: 'chainChanged', listener: (chainId: string) => void): this | void;
  on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): this | void;
  on(eventName: 'message', listener: (message: ProviderMessage) => void): this | void;
}
