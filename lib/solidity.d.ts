import { AbiType, DecodedTuple, DecodedType, T } from './abi';
import { Call, LogFilter, LogItem, LogTopic } from './types';
export { T };
export declare type SolidityType = AbiType;
export declare type OrArray<T> = T | T[];
export declare type EventQuery<Spec> = {
    [key in keyof Spec]?: Spec[key] extends SolidityType ? (OrArray<DecodedType<Spec[key]>> | null) : never;
};
export interface EventType<ParamSpec> {
    topic0: LogTopic;
    (filter: EventQuery<ParamSpec>): LogFilter;
    decode(item: LogItem): DecodedTuple<ParamSpec>;
}
export interface View<Params, Result> {
    (params: Params): Call<Result>;
}
export declare function View<ParamsSpec, ResultSpec>(methodName: string, params: ParamsSpec, returns: ResultSpec): View<DecodedTuple<ParamsSpec>, DecodedTuple<ResultSpec>>;
export declare function Method<ParamsSpec>(methodName: string, params: ParamsSpec): View<DecodedTuple<ParamsSpec>, void>;
export declare function EventType<ParamSpec>(name: string, paramsSpec: ParamSpec, index: (keyof ParamSpec)[]): EventType<ParamSpec>;
