"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC1155 = exports.ERC20 = void 0;
const _1 = require("./");
/**
 * https://eips.ethereum.org/EIPS/eip-20
 */
exports.ERC20 = {
    name: _1.chainMethod('name', {}, { name: _1.T.string }),
    balance: _1.chainMethod('balanceOf', { owner: _1.T.address }, { balance: _1.T.uint }),
    allowance: _1.chainMethod('allowance', { owner: _1.T.address, spender: _1.T.address }, { allowance: _1.T.uint }),
    approve: _1.chainMethod('approve', { spender: _1.T.address, value: _1.T.uint256 }),
    Transfer: _1.EventType('Transfer', { from: _1.T.address, to: _1.T.address, value: _1.T.uint256 }, ['from', 'to']),
};
/**
 * https://eips.ethereum.org/EIPS/eip-1155
 */
exports.ERC1155 = {
    balanceOfBatch: _1.chainMethod('balanceOfBatch', { accounts: _1.T.addressArray, ids: _1.T.uint256Array }, { balances: _1.T.uint256Array }),
    TransferSingle: _1.EventType('TransferSingle', {
        operator: _1.T.address,
        from: _1.T.address,
        to: _1.T.address,
        id: _1.T.uint256,
        value: _1.T.uint256,
    }, ['operator', 'from', 'to']),
};
