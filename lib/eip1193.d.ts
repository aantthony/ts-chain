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
    on(event: string, listener: any): this | unknown;
    removeListener(event: string, listener: any): this | unknown;
}
export interface EIP1193Provider extends SimpleEventEmitter {
    request(args: RequestArguments): Promise<unknown>;
    on(eventName: 'connect', listener: (connectInfo: ProviderConnectInfo) => void): this | unknown;
    on(eventName: 'disconnect', listener: (error: ProviderRpcError) => void): this | unknown;
    on(eventName: 'chainChanged', listener: (chainId: string) => void): this | unknown;
    on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): this | unknown;
    on(eventName: 'message', listener: (message: ProviderMessage) => void): this | unknown;
}
export {};
