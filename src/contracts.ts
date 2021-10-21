import { View, Method, EventType, T } from './solidity';

/**
 * https://eips.ethereum.org/EIPS/eip-20
 */
export const ERC20 = {
  name: View('name', {}, { name: T.string }),
  symbol: View('symbol', {}, { symbol: T.string }),
  balanceOf: View('balanceOf', { owner: T.address }, { balance: T.uint }),
  allowance: View('allowance', { owner: T.address, spender: T.address }, { allowance: T.uint }),
  approve: Method('approve', { spender: T.address, value: T.uint256 }),
  Transfer: EventType('Transfer', { from: T.address, to: T.address, value: T.uint256 }, ['from', 'to']),
};

/**
 * https://eips.ethereum.org/EIPS/eip-1155
 */
export const ERC1155 = {
  balanceOfBatch: View('balanceOfBatch', { accounts: T.addressArray, ids: T.uint256Array }, { balances: T.uint256Array }),
  TransferSingle: EventType('TransferSingle', {
    operator: T.address,
    from: T.address,
    to: T.address,
    id: T.uint256,
    value: T.uint256,
  }, ['operator', 'from', 'to']),
}
