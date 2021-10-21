import { _TypedDataEncoder } from '@ethersproject/hash';
import { recoverAddress } from '@ethersproject/transactions';
import { Address } from '.';
export function verifyTypedDataV4(domain, types, value, signature) {
    const addr = recoverAddress(_TypedDataEncoder.hash(domain, types, value), signature);
    return Address(addr);
}