import { keccak_256 } from 'js-sha3';
import { abiDecode, decodeObject, encodeObject, encodeTopic, T } from './abi';
export { T };
function assertString(val, forField) {
    if (typeof val === 'string')
        return val;
    throw new Error(`Expected string for ${forField}, got ${val}`);
}
function callSig(name, argTypes) {
    const n = `${name}(${argTypes.join(',')})`;
    return '0x' + keccak_256(n).substring(0, 8);
}
function eventSig(name, argTypes) {
    const n = `${name}(${argTypes.join(',')})`;
    return '0x' + keccak_256(n);
}
export function View(methodName, params, returns) {
    let sig = null;
    const decode = (data) => decodeObject(returns, data);
    return function createCall(arg) {
        sig = sig || callSig(methodName, Object.keys(params).map(n => assertString(params[n], `params[${n}] in ${methodName} definition`)));
        const argData = encodeObject(params, arg);
        const allData = (argData.length % 2 === 0)
            ? sig + argData.substring(2)
            : sig + '0' + argData.substring(2);
        return {
            data: allData,
            decode,
        };
    };
}
export function Method(methodName, params) {
    return View(methodName, params, {});
}
;
function decodeLogData(spec, index, item) {
    const res = { /* exampleParam: abc, ... */};
    const nonIndexedParamNames = Object.keys(spec).filter(k => {
        return index.indexOf(k) === -1;
    });
    const dataTypesArray = nonIndexedParamNames.map(n => spec[n]);
    const dataValuesArray = item.data !== '0x' ? abiDecode(dataTypesArray, item.data) : [];
    dataValuesArray.forEach((val, i) => {
        const t = dataTypesArray[i];
        res[nonIndexedParamNames[i]] = val;
    });
    const indexedNames = Object.keys(spec).filter(k => {
        return index.indexOf(k) !== -1;
    });
    indexedNames.forEach((n, i) => {
        const rawVal = item.topics[i + 1];
        const t = spec[n];
        const [v] = abiDecode([t], rawVal);
        res[n] = v;
    });
    return res;
}
export function EventType(name, paramsSpec, index) {
    let __storedTopic = null;
    function getTopic() {
        return __storedTopic || (__storedTopic = eventSig(name, Object.keys(paramsSpec).map(k => paramsSpec[k])));
    }
    const fn = (filter) => {
        const topics = [getTopic()];
        Object.keys(filter).forEach(k => {
            const indexPos = index.indexOf(k);
            if (indexPos === -1)
                throw new Error(`Cannot filter on "${k}" as it is not an indexed event parameter.`);
            const t = paramsSpec[k];
            const v = filter[k];
            topics[indexPos + 1] = Array.isArray(v)
                ? v.map(vv => encodeTopic(t, vv))
                : encodeTopic(t, v);
        });
        return topics;
    };
    const res = fn;
    Object.defineProperty(res, 'topic0', { get: getTopic });
    res.decode = item => decodeLogData(paramsSpec, index, item);
    return res;
}
