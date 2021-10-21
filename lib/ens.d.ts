import Chain, { Address } from '.';
/**
 * Reverse lookup on-chain.
 * @returns list of ENS names, in order
 */
export declare function reverseEnsLookup(chain: Chain, addresses: Address[]): Promise<string[]>;
export declare function namehash(labels: string[]): ArrayBuffer;
