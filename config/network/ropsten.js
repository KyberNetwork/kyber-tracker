module.exports = {
  "endpoints": {
    "web3Provider":"https://ropsten.infura.io",
    "ethScan": "https://ropsten.etherscan.io/",
    "getRate": "https://ropsten-cache.knstats.com/getRate",
    // "apis": "https://ropsten-api.kyber.network"
    "apis": "https://api.kyber.network"
  },
  "contractAddresses": {
    "wrapper": "0x9de0a60F4A489e350cD8E3F249f4080858Af41d3",
    "networks": ["0x818E6FECD516Ecc3849DAf6845e3EC868087B755"],
    "feeBurners": ["0x89B5c470559b80e541E53eF78244edD112c7C58A", "0x89B5c470559b80e541E53eF78244edD112c7C58A", "0x81ae4de9a3aec67a35c05c889052260e39bc42a4"],
    "workers": [],
    "internal": "0x3f9a8e219Ab1aD42f96b22C294E564B2b48fE636"
  },
  "logTopics": {
    "exchange": "0x1849bd6a030a1bca28b83437fd3de96f3d27a5d172fa7e9c78e7b61468928a39",
    "feeToWallet": "0x366bc34352215bf0bd3b527cfd6718605e1f5938777e42bcd8ed92f578368f52",
    "burnFee": "0xf838f6ddc89706878e3c3e698e9b5cbfbf2c0e3d3dcd0bd2e00f1ccf313e0185",
    "etherReceival": "0x75f33ed68675112c77094e7c5b073890598be1d23e27cd7f6907b4a7d98ac619",
    "erc20Transfer": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "burned":["0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5"],
    "kyberTrade": "0xd30ca399cb43507ecec6a629a35cf45eb98cda550c27696dcb0d8c4a3873ce6c"
  },
  "ETH": {
    "name": "Ethereum",
    "symbol": "ETH",
    "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "decimal": 18,
    "cmcId": "ethereum",
    "cmcIdv2": "1027",
    "cgId": "ethereum"
  },
  "KNC": {
    "name": "Kyber Network",
    "symbol": "KNC",
    "address": "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6",
    "decimal": 18,
    "cmcId": "1982",
  },
  
  "tokens": {
    "ETH": {
      "name": "Ethereum",
      "symbol": "ETH",
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal": 18,
      "cmcId": "1027",
      "hidden": true
    },
    "KNC": {
      "name": "Kyber Network",
      "symbol": "KNC",
      "address": "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6",
      "decimal": 18,
      "cmcId": "1982",
      "hidden": true
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "address": "0x4BFBa4a8F28755Cb2061c413459EE562c6B9c51b",
      "decimal": 18,
      "hidden": true
    },
    "EOS": {
      "name": "EOS",
      "symbol": "EOS",
      "address": "0xd5b4218B950A53fF07985E2d88346925c335EAe7",
      "decimal": 18,
      "delisted": true,
    },
    "SNT": {
      "name": "Status Network",
      "address": "0xbF5d8683b9BE6C43fcA607eb2a6f2626A18837a6",
      "symbol": "SNT",
      "decimal": 18,
      "hidden": true
    },
    "ELF": {
      "name": "AELF",
      "address": "0x9Fcc27c7320703c43368cf1A4bf076402cd0D6B4",
      "symbol": "ELF",
      "icon": "aelf.svg",
      "decimal": 18,
      "hidden": true
    },
    "POWR": {
      "name": "Power Ledger",
      "address": "0xa577731515303F0C0D00E236041855A5C4F114dC",
      "symbol": "POWR",
      "icon": "pwr.svg",
      "decimal": 6,
      "hidden": true
    },
    "MANA": {
      "name": "Decentraland",
      "address": "0xf5E314c435B3B2EE7c14eA96fCB3307C3a3Ef608",
      "symbol": "MANA",
      "decimal": 18,
      "hidden": true
    },
    "BAT": {
      "name": "Basic Attention Token",
      "address": "0xDb0040451F373949A4Be60dcd7b6B8D6E42658B6",
      "symbol": "BAT",
      "decimal": 18,
      "hidden": true
    },
    "REQ": {
      "name": "Request",
      "address": "0xb43D10BbE7222519Da899B72bF2c7f094b6F79D7",
      "symbol": "REQ",
      "decimal": 18,
      "hidden": true
    },
    "GTO": {
      "name": "GIFTO",
      "address": "0xe55c607d58c53b2B06A8E38f67F4c0FcAeEd2c31",
      "symbol": "GTO",
      "icon": "gifto.svg",
      "decimal": 5,
      "hidden": true
    },
    "RDN": {
      "name": "Raiden",
      "address": "0x5422Ef695ED0B1213e2B953CFA877029637D9D26",
      "symbol": "RDN",
      "decimal": 18,
      "hidden": true
    },
    "APPC": {
      "name": "AppCoins",
      "address": "0x2799f05B55d56be756Ca01Af40Bf7350787F48d4",
      "symbol": "APPC",
      "decimal": 18,
      "hidden": true
    },
    "ENG": {
      "name": "Enigma",
      "address": "0x95cc8d8f29D0f7fcC425E8708893E759d1599c97",
      "symbol": "ENG",
      "decimal": 8,
      "hidden": true
    },
    "SALT": {
      "name": "Salt",
      "address": "0xB47f1A9B121BA114d5e98722a8948e274d0F4042",
      "symbol": "SALT",
      "decimal": 8,
      "hidden": true
    },
    "BQX": {
      "symbol": "BQX",
      "name": "Ethos",
      "decimal": 8,
      "address": "0x9504A86A881F63Da06302FB3639d4582022097DB",
      "hidden": true
    },
    "ADX": {
      "symbol": "ADX",
      "name": "AdEx",
      "decimal": 4,
      "address": "0x499990DB50b34687CDaFb2C8DaBaE4E99d6F38A7",
      "hidden": true
    },
    "AST": {
      "symbol": "AST",
      "name": "AirSwap",
      "decimal": 4,
      "address": "0xeF06F410C26a0fF87b3a43927459Cce99268a2eF",
      "hidden": true
    },
    "RCN": {
      "symbol": "RCN",
      "name": "Ripio Credit Network",
      "decimal": 18,
      "address": "0x99338aa9218C6C23AA9d8cc2f3EFaf29954ea26B",
      "hidden": true
    },
    "ZIL": {
      "symbol": "ZIL",
      "name": "Zilliqa",
      "decimal": 12,
      "address": "0xaD78AFbbE48bA7B670fbC54c65708cbc17450167",
      "hidden": true
    },
    "DAI": {
      "symbol": "DAI",
      "name": "DAI",
      "decimal": 18,
      "address": "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
      "hidden": true
    },
    "LINK": {
      "symbol": "LINK",
      "name": "Chain Link",
      "decimal": 18,
      "address": "0xb4f7332ed719Eb4839f091EDDB2A3bA309739521",
      "hidden": true
    },
    "IOST": {
      "symbol": "IOST",
      "name": "IOStoken",
      "decimal": 18,
      "address": "0x27db28a6C4ac3D82a08D490cfb746E6F02bC467C",
      "hidden": true
    },
    "STORM": {
      "symbol": "STORM",
      "name": "Storm",
      "decimal": 18,
      "address": "0x8FFf7De21de8ad9c510704407337542073FDC44b",
      "hidden": true
    },
    "BBO": {
      "symbol": "BBO",
      "name": "BigBom",
      "decimal": 18,
      "address": "0xa94758d328af7ef1815e73053e95b5F86588C16D",
      "hidden": true
    },
    "COFI": {
      "name": "ConFi",
      "decimal": 18,
      "symbol" : "COFI",
      "address": "0xb91786188f8d4e35d6d67799e9f162587bf4da03",
      "hidden": true
    },
    "MOC": {
      "name": "Moss Coin",
      "decimal": 18,
      "symbol" : "MOC",
      "address": "0x1742c81075031b8f173d2327e3479d1fc3feaa76",
      "hidden": true
    },
    "BITX": {
      "name": "BitScreenerToken",
      "decimal": 18,
      "symbol" : "BITX",
      "address": "0x7a17267576318efb728bc4a0833e489a46ba138f",
      "icon": "bitx.png",
      "hidden": true
    }
  },

  "averageBlockTime": 15000,
  "startBlockNumber": 5060595,
  "startBlockNumberV2": 10000000, // TODO: kyber 2.0 start block

  "startPermissionlessReserveBlock": 4759402,

  "partners": {
    "olympus": "0x09227deaeE08a5Ba9D6Eb057F922aDfAd191c36c",
    "imtoken": "0xb9E29984Fe50602E7A619662EBED4F90D93824C7",
    "trust": "0xf1aa99c69715f423086008eb9d06dc1e35cc504d",
    "cipher": "0xDD61803d4a56C597E0fc864F7a20eC7158c6cBA5",
    "mew": "0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D"
  },

  "supportedLanguage": ["en", "vi", "ko", "zh"],
  "mappingLang_Moment": {
    "en" : "en",
    "vi" : "vi",
    "ko" : "ko",
    "zh" : "zh-cn"
  }
};
