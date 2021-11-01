import { Address, EIP712TypedDataDomain } from './types';
export declare function verifyTypedDataV4(domain: EIP712TypedDataDomain, types: any, value: any, signature: string): Address;
