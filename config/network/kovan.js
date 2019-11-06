module.exports = {
  "endpoints": {
    "web3Provider":"https://kovan.infura.io",
    "ethScan": "https://kovan.etherscan.io/",
    "getRate": "https://kovan-cache.knstats.com/getRate",
    "apis": "https://kovan-api.kyber.network"
    // "apis": "https://api.kyber.network"
  },
  "contractAddresses": {
    "wrapper": "0x9de0a60F4A489e350cD8E3F249f4080858Af41d3",
    "networks": ["0x692f391bCc85cefCe8C237C01e1f636BbD70EA4D"],
    "feeBurners": ["0x81ae4de9a3aec67a35c05c889052260e39bc42a4"],
    "workers": [],
    "internal": "0xb5034418f6cc1fd494535f2d38f770c9827f88a1"
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
  "reserves": {

  },
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
    "address": "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6",
    "decimal": 18,
    "cmcIdv2": "1982",
    "cgId": "kyber-network",
    "cmcId": "kyber-network",
  },
  "WETH": {
    "name": "Wrapped Ether",
    "symbol" : "WETH",
    "decimal": 18,
    "address": "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
    "hidden": true
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
    },
    "KNC": {
      "name": "Kyber Network",
      "symbol": "KNC",
      "address": "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6",
      "decimal": 18,
      "cmcIdv2": "1982",
      "cgId": "kyber-network",
      "cmcId": "kyber-network",
    },
    "WETH": {
      "name": "Wrapped Ether",
      "symbol" : "WETH",
      "decimal": 18,
      "address": "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "address": "0x4BFBa4a8F28755Cb2061c413459EE562c6B9c51b",
      "decimal": 18,
    },
    // "SAI": {
    //   "symbol": "SAI",
    //   "name": "SAI",
    //   "address": "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
    //   "decimal": 18
    // },
    // "DAI": {
    //   "symbol": "DAI",
    //   "name": "DAI",
    //   "address": "0x1d7e3a1a65a367db1d1d3f51a54ac01a2c4c92ff",
    //   "decimal": 18
    // }
    "DAI": {
      "symbol": "DAI",
      "name": "DAI",
      "address": "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
      "decimal": 18
    }
  },

  "averageBlockTime": 15000,
  "startBlockNumber": 14297273,
  "rateStartBlockNumber": 14297273,
  "startBlockNumberV2": 14297273, // TODO: kyber 2.0 start block

  "startPermissionlessReserveBlock": 14297273,

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
