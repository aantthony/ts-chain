export function Address(hexString) {
    return hexString.toLowerCase();
}
;
;
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
        const c = provider.chainId;
        this.id = typeof c === 'number' ? c : parseInt(c);
    }
    static create(provider) {
        return new Chain(provider);
    }
    static fromSendProvider(provider) {
        return new Chain({
            async request({ method, params }) {
                return provider.send(method, params);
            }
        });
    }
    async rpc(method, params) {
        if (params.length === undefined)
            throw new Error('invalid params array');
        // console.info(`ETH: ${method}(${params.map(e => JSON.stringify(e)).join(', ')})`);
        const json = toJson(params);
        const res = await this.provider.request({ method, params: json });
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
        return this.rpc('eth_sendTransaction', [params]);
    }
}