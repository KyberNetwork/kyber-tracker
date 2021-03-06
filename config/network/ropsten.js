module.exports = {
  "endpoints": {
    "web3Provider":"https://ropsten.infura.io",
    "ethScan": "https://ropsten.etherscan.io/",
    "getRate": "https://ropsten-cache.knstats.com/getRate",
    "apis": "https://ropsten-api.kyber.network"
    // "apis": "https://api.kyber.network"
  },
  "contractAddresses": {
    "wrapper": "0x9de0a60F4A489e350cD8E3F249f4080858Af41d3",
    "networks": ["0x818E6FECD516Ecc3849DAf6845e3EC868087B755", "0xc4684f4fbfc3db0a24cffe35821b12e55beaef7a", "0xd719c34261e099fdb33030ac8909d5788d3039c4"],
    "feeBurners": ["0x89B5c470559b80e541E53eF78244edD112c7C58A", "0x89B5c470559b80e541E53eF78244edD112c7C58A", "0x81ae4de9a3aec67a35c05c889052260e39bc42a4"],
    "feeHandler": ["0xff456d9a8cbb5352ef77dec2337bac8dec63beac"],
    "workers": [],
    "storage": "0xa4ead31a6c8e047e01ce1128e268c101ad391959",
    "katalystStorage": "0x688bf5EeC43E0799c5B9c1612F625F7b93FE5434",
    "internal": ["0x3f9a8e219Ab1aD42f96b22C294E564B2b48fE636", "0x920B322D4B8BAB34fb6233646F5c87F87e79952b"]
  },
  "logTopics": {
    "exchange": "0x1849bd6a030a1bca28b83437fd3de96f3d27a5d172fa7e9c78e7b61468928a39",
    "feeToWallet": "0x366bc34352215bf0bd3b527cfd6718605e1f5938777e42bcd8ed92f578368f52",
    "burnFee": "0xf838f6ddc89706878e3c3e698e9b5cbfbf2c0e3d3dcd0bd2e00f1ccf313e0185",
    "etherReceival": "0x75f33ed68675112c77094e7c5b073890598be1d23e27cd7f6907b4a7d98ac619",
    "erc20Transfer": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "burned":["0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5"],
    "kyberTrade": "0xd30ca399cb43507ecec6a629a35cf45eb98cda550c27696dcb0d8c4a3873ce6c",
    "feeDistributed": "0x53e2e1b5ab64e0a76fcc6a932558eba265d4e58c512401a7d776ae0f8fc08994",
    "feeDistributedKatana": "0xc207a63c18c4070ce1e33e5fcc02efb09ac984caa6a2046e2b1d2811723846f1",
    "katalystKyberTrade": "0x30bbea603a7b36858fe5e3ec6ba5ff59dde039d02120d758eacfaed01520577d",
    "katalystExecuteTrade": "0xf724b4df6617473612b53d7f88ecc6ea983074b30960a049fcd0657ffe808083",
    "katalystAddReserve": "0x50b2ce9e8f1a63ceaed262cc854dbf741b216e6429f7ba38403afbcdddc7f1ea",
    "kataLystRemoveReserve": "0xa5cd88a226efb041d6bdc0ac32964affd749b8a7c4d9e0c4ffba575e7180b1c9",
    "kataLystSetReserveWallet": "0x42cac9e63e37f62d5689493d04887a67fe3c68e1d3763c3f0890e1620a0465b3"
  },

  "ignoreReserveVolume": { 
    
  },
  "reserves": {
    "0x9d27a2d71ac44e075f764d5612581e9afc1964fd": ["Orderbook"],
    "0xba92981e049a79de1b79c2396d48063e02f47239": ["Bancor hybrid"],
    "0x44aef3101432a64d1aa16388f4b9b352b09f42a9": ["Oasis hybrid"],
    "0x5d154c145db2ca90b8ab5e8fe3e716afa4ab7ff0": ["Uniswap hybrid"],
    "0x6f50e41885fdc44dbdf7797df0393779a9c0a3a6": ["Olympus"],
    "0x04A487aFd662c4F9DEAcC07A7B10cFb686B682A4": ["Oasis hybrid 2"],
    "0xcb57809435c66006d16db062c285be9e890c96fc": ["Virgil Capital"],
    "0xeb52ce516a8d054a574905bdc3d4a176d3a2d51a": ["Kyber FPR", "FPR"],
    "0xfed79b3715982f1c812eb2d44695d73dbb1d86dd": ["KNC APR", "APR"],
    "0xb03fa646f3c030fc49e2602caac2befd8e8eff4e": ["WETH APR", "APR"],
    "0xa862548fb379c5c9e3047cae68b68e1cf5577dd5": ["Uniswap-Sushiswap Bridge Reserve", "BR"]
  },
  "blackListReserves": [
    "0xe140ad73a09342e927dbb184c397038432206c63",
    "0x072bfe95e2b8050221de8ab324ab11cc7d66d75b",
    "0x00f910607cc18b875d2ea0f14243957c3a7a634f"
  ],
  "ETH": {
    "name": "Ethereum",
    "symbol": "ETH",
    "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "decimal": 18,
    "cmcId": "ethereum",
    "cmcIdv2": "1027",
    "cgId": "ethereum",
    "official": true
  },
  "KNC": {
    "name": "Kyber Network",
    "symbol": "KNC",
    "address": "0x7b2810576aa1cce68f2b118cef1f36467c648f92",
    "decimal": 18,
    "cmcIdv2": "1982",
    "cgId": "kyber-network",
    "cmcId": "kyber-network",
  },
  "WETH": {
    "name": "Wrapped Ether",
    "symbol" : "WETH",
    "decimal": 18,
    "address": "0xbca556c912754bc8e7d4aad20ad69a1b1444f42d",
    "hidden": true
  },

  "PT":{
    "name": "Promotion Token",
    "symbol" : "PT",
    "decimal": 18,
    "address": "0x094c875704c14783049ddf8136e298b3a099c446",
    "hidden": 1543938161000       
  },
  
  "tokens": {
    "ETH": {
      "name": "Ethereum",
      "symbol": "ETH",
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal": 18,
      "cmcId": "ethereum",
      "cmcIdv2": "1027",
      "cgId": "ethereum",
      "hidden": true
    },
    "KNC": {
      "name": "Kyber Network",
      "symbol": "KNC",
      "address": "0x7b2810576aa1cce68f2b118cef1f36467c648f92",
      "decimal": 18,
      "cmcIdv2": "1982",
      "cgId": "kyber-network",
      "cmcId": "kyber-network",
      "hidden": true
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "address": "0x4bfba4a8f28755cb2061c413459ee562c6b9c51b",
      "decimal": 18,
      "hidden": true
    },
    "EOS": {
      "name": "EOS",
      "symbol": "EOS",
      "address": "0xd5b4218b950a53ff07985e2d88346925c335eae7",
      "decimal": 18,
      "delisted": true,
    },
    "SNT": {
      "name": "Status Network",
      "address": "0xbf5d8683b9be6c43fca607eb2a6f2626a18837a6",
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

    "WETH": {
      "name": "Wrapped Ether",
      "symbol" : "WETH",
      "decimal": 18,
      "address": "0xbca556c912754bc8e7d4aad20ad69a1b1444f42d"
    },

    "WBTC":{
      "name": "	Wrapped BTC",
      "symbol" : "WBTC",
      "decimal": 8,
      "address": "0x3dff0dce5fc4b367ec91d31de3837cf3840c8284",
      "hidden": 1548853200000       
    },
    
    "VIDT": {
      "name": "V-ID",
      "decimal": 18,
      "symbol" : "BITX",
      "address": "0x0ad0ba55133fd13cfd29ca687d85a15edcca611e",
      "icon": "bitx.png",
      "hidden": true
    }
  },

  "dapps": {
  },

  "averageBlockTime": 15000,
  "startBlockNumber": 5060595,
  "rateStartBlockNumber": 5500000,
  "startBlockNumberV2": 10000000, // TODO: kyber 2.0 start block

  "startPermissionlessReserveBlock": 4759402,
  "startKataLystBlock": 8111008,

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
