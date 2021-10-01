import uts46 from 'idna-uts46-hx';
import { keccak_256 } from 'js-sha3';
import Chain, { Address, chainMethod, T } from './';

// https://github.com/ensdomains/reverse-records
const REVERSE_RECORDS_MAINNET = new Address('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C');

const getNames = chainMethod('getNames', { addresses: T.addressArray }, { r: T.stringArray });

function normalize(name: string) {
  return uts46.toAscii(name, {
    useStd3ASCII: true,
    transitional: false,
    verifyDnsLength: false,
  });
}

/**
 * Reverse lookup on-chain.
 * @returns list of ENS names, in order
 */
export async function reverseEnsLookup(chain: Chain, addresses: Address[]): Promise<string[]> {
  const { r } = await chain.call(REVERSE_RECORDS_MAINNET, getNames({ addresses }));

  return r.map(n => {
    // Prevent homograph attack
    const safe = normalize(n) === n;

    return safe ? n : '';
  });
}

function sha3(...params: (ArrayBuffer | string)[]) {
  return params.reduce((h, c) => h.update(c), keccak_256.create()).arrayBuffer();
}

export function namehash(labels: string[]) {
  return labels
  .map(label => sha3(normalize(label)))
  .reduce(
    (n, labelHash) => sha3(n, labelHash),
    new ArrayBuffer(32)
  );
}
