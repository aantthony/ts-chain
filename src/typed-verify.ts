import { _TypedDataEncoder } from '@ethersproject/hash';
import { recoverAddress } from '@ethersproject/transactions';
import { Address, EIP712TypedDataDomain } from '.';

export function verifyTypedDataV4(domain: EIP712TypedDataDomain, types: any, value: any, signature: string): Address {
  const addr = recoverAddress(_TypedDataEncoder.hash(domain, types, value), signature);
  return Address(addr);
}
