import { keccak_256 } from 'js-sha3';
import { abiDecode, AbiType, DecodedTuple, DecodedType, decodeObject, encodeObject, encodeTopic, T } from './abi';
import { Call, CallData, Data, LogFilter, LogItem, LogTopic } from './types';

export { T };

export type SolidityType = AbiType;

export type OrArray<T> = T | T[];

function assertString(val: unknown, forField: string): string {
  if (typeof val === 'string') return val;
  throw new Error(`Expected string for ${forField}, got ${val}`);
}

export type EventQuery<Spec> = {
  [key in keyof Spec]?: Spec[key] extends SolidityType ? (OrArray<DecodedType<Spec[key]>> | null) : never;
}

export interface EventType<ParamSpec> {
  topic0: LogTopic;
  (filter: EventQuery<ParamSpec>): LogFilter;
  decode(item: LogItem): DecodedTuple<ParamSpec>;
}

function callSig(name: string, argTypes: string[]) {
  const n = `${name}(${argTypes.join(',')})`;
  return '0x' + keccak_256(n).substring(0, 8) as Data;
}

function eventSig(name: string, argTypes: string[]): LogTopic {
  const n = `${name}(${argTypes.join(',')})`;
  return '0x' + keccak_256(n) as LogTopic;
}

export interface View<Params, Result> {
  (params: Params): Call<Result>;
}

export function View<ParamsSpec, ResultSpec>(
  methodName: string,
  params: ParamsSpec,
  returns: ResultSpec
): View<DecodedTuple<ParamsSpec>, DecodedTuple<ResultSpec>> {
  let sig: Data | null = null;

  const decode = (data: Data) => decodeObject(returns, data);

  return function createCall(arg): Call<DecodedTuple<ResultSpec>> {
    sig = sig || callSig(
      methodName,
      Object.keys(params).map(n => assertString((params as any)[n], `params[${n}] in ${methodName} definition`))
    );

    const argData = encodeObject(params, arg);

    const allData = (argData.length % 2 === 0)
      ? sig + argData.substring(2)
      : sig + '0' + argData.substring(2);

    return {
      data: allData as CallData,
      decode,
    };
  }
}

export function Method<ParamsSpec>(
  methodName: string,
  params: ParamsSpec
): View<DecodedTuple<ParamsSpec>, void> {
  return View(methodName, params, {});
};

function decodeLogData<ParamSpec>(spec: ParamSpec, index: (keyof ParamSpec)[], item: LogItem): DecodedTuple<ParamSpec> {
  const res: any = { /* exampleParam: abc, ... */ };
  const nonIndexedParamNames = Object.keys(spec).filter(k => {
    return index.indexOf(k as any) === -1;
  });
  const dataTypesArray = nonIndexedParamNames.map(n => (spec as any)[n]);
  const dataValuesArray = item.data !== '0x' ? abiDecode(dataTypesArray, item.data) : [];
  dataValuesArray.forEach((val, i) => {
    const t = dataTypesArray[i];
    res[nonIndexedParamNames[i]] = val;
  });

  const indexedNames = Object.keys(spec).filter(k => {
    return index.indexOf(k as any) !== -1;
  });
  indexedNames.forEach((n, i) => {
    const rawVal = item.topics[i + 1];
    const t = (spec as any)[n];
    const [v] = abiDecode([t], rawVal as string as Data);
    res[n] = v;
  });

  return res;
}

export function EventType<ParamSpec>(name: string, paramsSpec: ParamSpec, index: (keyof ParamSpec)[]): EventType<ParamSpec> {
  let __storedTopic: LogTopic | null = null;
  function getTopic(): LogTopic {
    return __storedTopic || (__storedTopic = eventSig(name, Object.keys(paramsSpec).map(k => (paramsSpec as any)[k])));
  }

  const fn = (filter: EventQuery<ParamSpec>): LogFilter => {
    const topics: LogFilter = [getTopic()];
    Object.keys(filter).forEach(k => {
      const indexPos = index.indexOf(k as any);
      if (indexPos === -1) throw new Error(`Cannot filter on "${k}" as it is not an indexed event parameter.`);
      const t: AbiType = (paramsSpec as any)[k];
      const v: any = (filter as any)[k];
      
      topics[indexPos + 1] = Array.isArray(v)
        ? v.map(vv => encodeTopic(t, vv))
        : encodeTopic(t, v);
    });

    return topics;
  };

  const res = fn as EventType<ParamSpec>;

  Object.defineProperty(res, 'topic0', { get: getTopic });

  res.decode = item => decodeLogData(paramsSpec, index, item);

  return res;
}


