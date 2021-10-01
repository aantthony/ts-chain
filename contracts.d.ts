import { EventType } from './';
/**
 * https://eips.ethereum.org/EIPS/eip-20
 */
export declare const ERC20: {
    name: (arg: import("./").DecodedTuple<{}>) => import("./").CallData<{
        name: "string";
    }>;
    balance: (arg: import("./").DecodedTuple<{
        owner: "address";
    }>) => import("./").CallData<{
        balance: "uint";
    }>;
    allowance: (arg: import("./").DecodedTuple<{
        owner: "address";
        spender: "address";
    }>) => import("./").CallData<{
        allowance: "uint";
    }>;
    approve: (arg: import("./").DecodedTuple<{
        spender: "address";
        value: "uint256";
    }>) => import("./").CallData<unknown>;
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
    balanceOfBatch: (arg: import("./").DecodedTuple<{
        accounts: "address[]";
        ids: "uint256[]";
    }>) => import("./").CallData<{
        balances: "uint256[]";
    }>;
    TransferSingle: EventType<{
        operator: "address";
        from: "address";
        to: "address";
        id: "uint256";
        value: "uint256";
    }>;
};
