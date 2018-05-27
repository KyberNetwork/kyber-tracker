module.exports = [{
    "constant": true,
    "inputs": [{
        "name": "x",
        "type": "bytes14"
    }, {
        "name": "byteInd",
        "type": "uint256"
    }],
    "name": "getInt8FromByte",
    "outputs": [{
        "name": "",
        "type": "int8"
    }],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "reserve",
        "type": "address"
    }, {
        "name": "tokens",
        "type": "address[]"
    }],
    "name": "getBalances",
    "outputs": [{
        "name": "",
        "type": "uint256[]"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "pricingContract",
        "type": "address"
    }, {
        "name": "tokenList",
        "type": "address[]"
    }],
    "name": "getTokenIndicies",
    "outputs": [{
        "name": "",
        "type": "uint256[]"
    }, {
        "name": "",
        "type": "uint256[]"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "x",
        "type": "bytes14"
    }, {
        "name": "byteInd",
        "type": "uint256"
    }],
    "name": "getByteFromBytes14",
    "outputs": [{
        "name": "",
        "type": "bytes1"
    }],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "network",
        "type": "address"
    }, {
        "name": "sources",
        "type": "address[]"
    }, {
        "name": "dests",
        "type": "address[]"
    }, {
        "name": "qty",
        "type": "uint256[]"
    }],
    "name": "getExpectedRates",
    "outputs": [{
        "name": "expectedRate",
        "type": "uint256[]"
    }, {
        "name": "slippageRate",
        "type": "uint256[]"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "pricingContract",
        "type": "address"
    }, {
        "name": "tokenList",
        "type": "address[]"
    }],
    "name": "getTokenRates",
    "outputs": [{
        "name": "",
        "type": "uint256[]"
    }, {
        "name": "",
        "type": "uint256[]"
    }, {
        "name": "",
        "type": "int8[]"
    }, {
        "name": "",
        "type": "int8[]"
    }, {
        "name": "",
        "type": "uint256[]"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}];