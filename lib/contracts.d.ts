import { View, EventType } from './solidity';
/**
 * https://eips.ethereum.org/EIPS/eip-20
 */
export declare const ERC20: {
    name: View<import("./abi").DecodedTuple<{}>, import("./abi").DecodedTuple<{
        name: "string";
    }>>;
    symbol: View<import("./abi").DecodedTuple<{}>, import("./abi").DecodedTuple<{
        symbol: "string";
    }>>;
    balanceOf: View<import("./abi").DecodedTuple<{
        owner: "address";
    }>, import("./abi").DecodedTuple<{
        balance: "uint";
    }>>;
    allowance: View<import("./abi").DecodedTuple<{
        owner: "address";
        spender: "address";
    }>, import("./abi").DecodedTuple<{
        allowance: "uint";
    }>>;
    approve: View<import("./abi").DecodedTuple<{
        spender: "address";
        value: "uint256";
    }>, void>;
    Transfer: EventType<{
        from: "address";
        to: "address";
        value: "uint256";
    }>;
};
/**
 * https://eips.ethereum.org/EIPS/eip-1155
 */
export declare const ERC1155: {
    balanceOfBatch: View<import("./abi").DecodedTuple<{
        accounts: "address[]";
        ids: "uint256[]";
    }>, import("./abi").DecodedTuple<{
        balances: "uint256[]";
    }>>;
    TransferSingle: EventType<{
        operator: "address";
        from: "address";
        to: "address";
        id: "uint256";
        value: "uint256";
    }>;
};
