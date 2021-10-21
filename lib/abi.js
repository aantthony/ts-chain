import { defaultAbiCoder } from '@ethersproject/abi';
import { Address } from '.';
export const T = {
    address: 'address',
    addressArray: 'address[]',
    uint16Array: 'uint16[]',
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
    address(val) { return Address(val); },
    'uint16[]'(val) { return val.map(v => (BigInt(v))); },
    'uint256[]'(val) { return val.map(v => (BigInt(v))); },
    'address[]'(val) { return val.map(v => Address(v)); },
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
function abiEncode(types, values) {
    return defaultAbiCoder.encode(types, values);
}
function normalize(val, type) {
    if (val.toBigInt) {
        return val.toBigInt();
    }
    const dec = Decoder[type];
    if (!dec)
        throw new Error(`Cannot decode ${type}.`);
    return Decoder[type](val);
}
export function abiDecode(types, data) {
    return defaultAbiCoder.decode(types, data).map((d, i) => normalize(d, types[i]));
}
export function decodeObject(spec, data) {
    const typesArray = [];
    const rTypeObj = spec;
    const repsonseKeys = Object.keys(rTypeObj);
    repsonseKeys.forEach(k => {
        const v = rTypeObj[k];
        typesArray.push(v);
        repsonseKeys.push(k);
    });
    const rArray = abiDecode(typesArray, data);
    const retValue = {};
    rArray.forEach((item, index) => {
        const t = typesArray[index];
        retValue[repsonseKeys[index]] = normalize(item, t);
    });
    return retValue;
}
export function encodeObject(spec, value) {
    const typesArray = [];
    const valuesArray = [];
    Object.keys(spec)
        .forEach(k => {
        const t = spec[k];
        typesArray.push(t);
        valuesArray.push(value[k], t);
    });
    return abiEncode(typesArray, valuesArray);
}
export function encodeTopic(t, v) {
    return abiEncode([t], [v]);
}
