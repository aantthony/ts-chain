"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTypedDataV4 = void 0;
const hash_1 = require("@ethersproject/hash");
const transactions_1 = require("@ethersproject/transactions");
const _1 = require(".");
function verifyTypedDataV4(domain, types, value, signature) {
    const addr = transactions_1.recoverAddress(hash_1._TypedDataEncoder.hash(domain, types, value), signature);
    return _1.Address(addr);
}
exports.verifyTypedDataV4 = verifyTypedDataV4;
