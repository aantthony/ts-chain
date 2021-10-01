import { defaultAbiCoder } from '@ethersproject/abi';
import { verifyTypedData } from '@ethersproject/wallet';
import { hexConcat } from '@ethersproject/bytes';
import { keccak_256 } from 'js-sha3';
export class Address {
    constructor(string) {
        this.string = string;
    }
    /**
     * Returns the commonly used substring of the address.
     * @returns 0x1234...ABCD
     */
    short() {
        return this.string.substring(0, 6) + '...' + this.string.substring(36);
    }
}
export class TxHash {
    constructor(txHash) {
        this.txHash = txHash;
    }
}
export class BlockHash {
    constructor(blockHash) {
        this.blockHash = blockHash;
    }
}
export const T = {
    address: 'address',
    addressArray: 'address[]',
    uint256Array: 'uint256[]',
    stringArray: 'string[]',
    string: 'string',
    uint8: 'uint8',
    uint16: 'uint16',
    uint32: 'uint32',
    uint64: 'uint64',
    uint128: 'uint128',
    uint256: 'uint256',
    bytes32: 'bytes32',
    uint: 'uint',
    Array(x) {
        return `${x}[]`;
    }
};
const Decoder = {
    uint(val) { return BigInt(val); },
    string(val) { return val; },
    address(val) { return new Address(val); },
    'uint256[]'(val) { return val.map(v => (BigInt(v))); },
    'address[]'(val) { return val.map(v => new Address(v)); },
    'string[]'(val) { return val; },
    uint8(val) { return BigInt(val); },
    uint16(val) { return BigInt(val); },
    uint32(val) { return BigInt(val); },
    uint64(val) { return BigInt(val); },
    uint128(val) { return BigInt(val); },
    uint256(val) { return BigInt(val); },
    bytes32(val) { return BigInt(val); },
    bool(val) {
        if (val === true)
            return true;
        if (val === false)
            return false;
        throw new Error(`Unknown boolean: ${val}`);
    },
};
export class CallData {
    constructor(data, expectedResultType) {
        this.data = data;
        this.expectedResultType = expectedResultType;
    }
}
export class EventFilter {
    constructor(topics, params, index) {
        this.topics = topics;
        this.params = params;
        this.index = index;
    }
}
function buildCompactCallName(name, argTypes) {
    return `${name}(${argTypes.join(',')})`;
}
function callSig(name) {
    return '0x' + keccak_256(name).substring(0, 8);
}
function eventSig(name, argTypes) {
    const n = `${name}(${argTypes.join(',')})`;
    return '0x' + keccak_256(n);
}
function assertString(val, forField) {
    if (typeof val === 'string')
        return val;
    throw new Error(`Expected string for ${forField}, got ${val}`);
}
function encode(value, t) {
    if (Array.isArray(value))
        return value.map(e => encode(e, '?'));
    if (value instanceof Address) {
        return value.string;
    }
    return value;
}
function encodeArgData(argTypes, arg) {
    const typesArray = [];
    const valuesArray = [];
    Object.keys(argTypes)
        .forEach(k => {
        const t = argTypes[k];
        typesArray.push(t);
        valuesArray.push(encode(arg[k], t));
    });
    return defaultAbiCoder.encode(typesArray, valuesArray);
}
export function EventType(name, params, index) {
    let topic0 = null;
    return function (filter) {
        topic0 = topic0 || eventSig(name, Object.keys(params).map(k => params[k]));
        const retValue = [topic0];
        Object.keys(filter).forEach(k => {
            const indexPos = index.indexOf(k);
            if (indexPos === -1)
                throw new Error(`Cannot filter on "${k}" as it is not an indexed event parameter.`);
            const t = params[k];
            const v = encode(filter[k], t);
            retValue[indexPos + 1] = defaultAbiCoder.encode([t], [v]);
        });
        return new EventFilter(retValue, params, index);
    };
}
export function chainMethod(methodName, argTypes, resultType) {
    let sig = null;
    return function getCallData(arg) {
        sig = sig || callSig(buildCompactCallName(methodName, Object.keys(argTypes).map(n => assertString(argTypes[n], `argTypes[${n}] in ${methodName} definition`))));
        const argData = encodeArgData(argTypes, arg);
        const allData = hexConcat([sig, argData]);
        return new CallData(allData, resultType);
    };
}
function decodeValue(val, type) {
    if (val.toBigInt) {
        return val.toBigInt();
    }
    const dec = Decoder[type];
    if (!dec)
        throw new Error(`Cannot decode ${type}.`);
    return Decoder[type](val);
}
function decodeObject(returnTypeObject, dataString) {
    const typesArray = [];
    const rTypeObj = returnTypeObject;
    const repsonseKeys = Object.keys(rTypeObj);
    repsonseKeys.forEach(k => {
        const v = rTypeObj[k];
        typesArray.push(v);
        repsonseKeys.push(k);
    });
    const rObj = defaultAbiCoder.decode(typesArray, dataString);
    const retValue = {};
    rObj.forEach((item, index) => {
        const t = typesArray[index];
        retValue[repsonseKeys[index]] = decodeValue(item, t);
    });
    return retValue;
}
;
function toJson(obj) {
    if (obj instanceof Address)
        return obj.string;
    if (obj instanceof TxHash)
        return obj.txHash;
    if (typeof obj === 'bigint')
        return '0x' + obj.toString(16);
    if (Array.isArray(obj))
        return obj.map(toJson);
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
    throw new Error('could not encode');
}
export function verifyTypedDataV4(domain, types, value, signature) {
    const addr = verifyTypedData({
        name: domain.name,
        version: domain.version,
        chainId: domain.chainId,
        verifyingContract: domain.verifyingContract.string,
    }, types, value, signature);
    return new Address(addr);
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
            domain: {
                name: domain.name,
                version: domain.version,
                chainId: domain.chainId,
                verifyingContract: domain.verifyingContract.string,
            },
            types: {
                EIP712Domain,
                ...types,
            },
            message,
            primaryType,
        };
        return this.rpc('eth_signTypedData_v4', [
            account.string,
            JSON.stringify(req),
        ]);
    }
    async getBlockNumber() {
        const s = await this.rpc('eth_blockNumber', []);
        return BigInt(s);
    }
    async getAccounts() {
        const strings = await this.rpc('eth_accounts', []);
        return strings.map(s => new Address(s));
    }
    async getBalance(accounts) {
        const resData = await this.rpc('eth_getBalance', [...accounts.map(a => a.string), 'latest']);
        return BigInt(resData);
    }
    async getTransaction(logEntry) {
        return this.rpc('eth_getTransactionByBlockHashAndIndex', [
            logEntry.blockHash.blockHash,
            logEntry.txIndex,
        ]);
    }
    async logs(event, filter) {
        const results = await this.rpc('eth_getLogs', [
            {
                fromBlock: filter.fromBlock,
                toBlock: filter.toBlock,
                address: filter.address ? filter.address.string : undefined,
                topics: event.topics,
            },
        ]);
        return results.map((log) => {
            const res = {};
            const dataNamesArray = Object.keys(event.params).filter(k => {
                return event.index.indexOf(k) === -1;
            });
            const dataTypesArray = dataNamesArray.map(n => event.params[n]);
            const arrayObj = log.data !== '0x' ? defaultAbiCoder.decode(dataTypesArray, log.data) : [];
            arrayObj.forEach((val, i) => {
                const t = dataTypesArray[i];
                res[dataNamesArray[i]] = decodeValue(val, t);
            });
            const indexedNames = Object.keys(event.params).filter(k => {
                return event.index.indexOf(k) !== -1;
            });
            indexedNames.forEach((n, i) => {
                const rawVal = log.topics[i + 1];
                const t = event.params[n];
                const [v] = defaultAbiCoder.decode([t], rawVal);
                res[n] = decodeValue(v, t);
            });
            return {
                address: new Address(log.address),
                blockHash: new BlockHash(log.blockHash),
                blockNumber: BigInt(log.blockNumber),
                tx: new TxHash(log.transactionHash),
                txIndex: BigInt(log.transactionIndex),
                params: res,
            };
        });
    }
    async getTransactionReceipt(tx) {
        if (!tx.txHash)
            throw new Error('missing');
        return this.rpc('eth_getTransactionReceipt', [tx.txHash]);
    }
    async call(to, callData) {
        const rString = await this.rpc('eth_call', [{ to: to.string, data: callData.data }, 'latest']);
        return decodeObject(callData.expectedResultType, rString);
    }
    async transact(to, callData, params) {
        function enc(n) {
            if (n === undefined)
                return undefined;
            return `0x${n.toString(16)}`;
        }
        const tx = {
            from: params.from ? params.from.string : undefined,
            to: to.string,
            gas: enc(params.gas),
            gasPrice: enc(params.gasPrice),
            value: enc(params.value || 0n),
            data: callData.data,
        };
        const hash = await this.rpc('eth_sendTransaction', [tx]);
        return new TxHash(hash);
    }
}
