export function Address(hexString) {
    return hexString.toLowerCase();
}
export function ChainId(hexStringOrNumber) {
    if (typeof hexStringOrNumber === 'number') {
        return '0x' + hexStringOrNumber.toString(16);
    }
    return hexStringOrNumber.toLowerCase();
}
;
;
//# sourceMappingURL=types.js.map