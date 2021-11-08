import { T } from './abi';
import { ERC1155, ERC20 } from './contracts';
import { EventType, Method, View } from './solidity';
import { verifyTypedDataV4 } from './typed-verify';
import { Address, ChainId } from './types';
export { Address, ChainId };
export { ERC1155, ERC20 };
export { verifyTypedDataV4 };
export { Method, View, EventType, T };
class ChainProviderRpcError extends Error {
    constructor(message, code, data) {
        super(message);
        this.code = code;
        this.data = data;
    }
}
function toJson(obj) {
    if (typeof obj === 'bigint')
        return `0x${obj.toString(16)}`;
    if (Array.isArray(obj))
        return obj.map(toJson);
    if (obj === null)
        return null;
    if (typeof obj === 'boolean')
        return obj;
    if (typeof obj === 'object') {
        const res = {};
        Object.keys(obj).forEach(k => {
            const v = obj[k];
            if (v !== undefined) {
                res[k] = toJson(v);
            }
        });
        return res;
    }
    if (typeof obj === 'string')
        return obj;
    throw new Error(`could not encode ${typeof obj}`);
}
export default class Chain {
    constructor(provider) {
        this.provider = provider;
        if (!provider)
            throw new Error('missing provider in Chain constructor');
    }
    static create(provider) {
        return new Chain(provider);
    }
    static fromSendProvider(provider) {
        return new Chain({
            async request({ method, params }) {
                return provider.send(method, params);
            },
            on(eventName, listener) {
                return this;
            },
            removeListener() {
                return this;
            }
        });
    }
    async rpc(method, params) {
        if (params.length === undefined)
            throw new Error('invalid params array');
        // console.info(`ETH: ${method}(${params.map(e => JSON.stringify(e)).join(', ')})`);
        const json = toJson(params);
        const res = await this.provider.request({ method, params: json })
            .catch(err => {
            // Some providers (e.g. @walletconnect/ethereum-provider)
            // emit strings for errors instead of EIP-1193 errors
            if (typeof err === 'string')
                throw new ChainProviderRpcError(err, -1);
            // Otherwise just assume it is correct
            throw err;
        });
        // console.info(`ETH: ${method}(${params.map(e => JSON.stringify(e)).join(', ')})`, `${JSON.stringify(res)}`);
        return res;
    }
    async signedTypedDataV4(account, domain, types, message, primaryType) {
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
    async getBlockNumber() {
        return this.rpc('eth_blockNumber', []);
    }
    async getBlockByHash(blockHash, includeTransactions) {
        return this.rpc('eth_getBlockByHash', [blockHash, includeTransactions]);
    }
    async getBlockByNumber(n, includeTransactions) {
        return this.rpc('eth_getBlockByNumber', [n, includeTransactions]);
    }
    async getAccounts() {
        return this.rpc('eth_accounts', []);
    }
    async getBalance(accounts) {
        return this.rpc('eth_getBalance', [...accounts, 'latest']);
    }
    async getTransaction(logEntry) {
        return this.rpc('eth_getTransactionByBlockHashAndIndex', [logEntry.blockHash, logEntry.txIndex]);
    }
    async getLogs(params) {
        return this.rpc('eth_getLogs', [params]);
    }
    async getTransactionReceipt(tx) {
        return this.rpc('eth_getTransactionReceipt', [tx]);
    }
    async call(to, call) {
        const hasDecoder = typeof call === 'object';
        const data = hasDecoder ? call.data : call;
        const result = await this.rpc('eth_call', [{ to, data }, 'latest']);
        return hasDecoder ? call.decode(result) : result;
    }
    async transact(params) {
        params.value = params.value || 0n;
        if (typeof params.data === 'object') {
            params.data = params.data.data;
        }
        return this.rpc('eth_sendTransaction', [params]);
    }
    /**
     * Returns the currently configured chain ID, a value used in replay-protected transaction signing as introduced by EIP-155.
     * https://eips.ethereum.org/EIPS/eip-695
     */
    async getChainId() {
        return this.rpc('eth_chainId', []);
    }
    /**
     * https://eips.ethereum.org/EIPS/eip-3085
     */
    async addEthereumChain(params) {
        await this.rpc('wallet_addEthereumChain', [params]);
    }
    /**
     * https://eips.ethereum.org/EIPS/eip-3326
     */
    async switchEthereumChain(chainId) {
        await this.rpc('wallet_switchEthereumChain', [{ chainId }]);
    }
}
//# sourceMappingURL=index.js.map