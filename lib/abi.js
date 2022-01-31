import { defaultAbiCoder } from '@ethersproject/abi';
import { Address } from './types';
export const T = {
    address: 'address',
    addressArray: 'address[]',
    uint16Array: 'uint16[]',
    uint256Array: 'uint256[]',
    stringArray: 'string[]',
    string: 'string',
    bool: 'bool',
    uint8: 'uint8',
    uint16: 'uint16',
    uint32: 'uint32',
    uint48: 'uint48',
    uint64: 'uint64',
    uint128: 'uint128',
    uint256: 'uint256',
    int8: 'int8',
    int16: 'int16',
    int32: 'int32',
    int48: 'int48',
    int64: 'int64',
    int128: 'int128',
    int256: 'int256',
    bytes32: 'bytes32',
    // Shorthand for uint256
    uint: 'uint256',
    Array(x) {
        return `${x}[]`;
    }
};
function toBigInt(val) {
    return BigInt(val);
}
function decodeIntArray(val) {
    return val.map(v => (BigInt(v)));
    ;
}
const Decoder = {
    string(val) { return val; },
    address(val) { return Address(val); },
    'uint8[]': decodeIntArray,
    'uint16[]': decodeIntArray,
    'uint32[]': decodeIntArray,
    'uint48[]': decodeIntArray,
    'uint64[]': decodeIntArray,
    'uint128[]': decodeIntArray,
    'uint256[]': decodeIntArray,
    'address[]'(val) { return val.map(v => Address(v)); },
    'string[]'(val) { return val; },
    uint8: toBigInt,
    uint16: toBigInt,
    uint32: toBigInt,
    uint48: toBigInt,
    uint64: toBigInt,
    uint128: toBigInt,
    uint256: toBigInt,
    bytes32: toBigInt,
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
        valuesArray.push(value[k]);
    });
    return abiEncode(typesArray, valuesArray);
}
export function encodeTopic(t, v) {
    return abiEncode([t], [v]);
}
//# sourceMappingURL=abi.js.map