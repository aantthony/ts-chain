"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.namehash = exports.reverseEnsLookup = void 0;
const idna_uts46_hx_1 = __importDefault(require("idna-uts46-hx"));
const js_sha3_1 = require("js-sha3");
const _1 = require("./");
// https://github.com/ensdomains/reverse-records
const REVERSE_RECORDS_MAINNET = new _1.Address('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C');
const getNames = _1.chainMethod('getNames', { addresses: _1.T.addressArray }, { r: _1.T.stringArray });
function normalize(name) {
    return idna_uts46_hx_1.default.toAscii(name, {
        useStd3ASCII: true,
        transitional: false,
        verifyDnsLength: false,
    });
}
/**
 * Reverse lookup on-chain.
 * @returns list of ENS names, in order
 */
async function reverseEnsLookup(chain, addresses) {
    const { r } = await chain.call(REVERSE_RECORDS_MAINNET, getNames({ addresses }));
    return r.map(n => {
        // Prevent homograph attack
        const safe = normalize(n) === n;
        return safe ? n : '';
    });
}
exports.reverseEnsLookup = reverseEnsLookup;
function sha3(...params) {
    return params.reduce((h, c) => h.update(c), js_sha3_1.keccak_256.create()).arrayBuffer();
}
function namehash(labels) {
    return labels
        .map(label => sha3(normalize(label)))
        .reduce((n, labelHash) => sha3(n, labelHash), new ArrayBuffer(32));
}
exports.namehash = namehash;
