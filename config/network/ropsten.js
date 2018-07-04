module.exports = {
  "endpoints": {
    "web3Provider":"https://ropsten.infura.io",
    "ethScan": "https://ropsten.etherscan.io/"
  },
  "contractAddresses": {
    "wrapper": "0x9de0a60F4A489e350cD8E3F249f4080858Af41d3",
    "networks": ["0x0a56d8a49E71da8d7F9C65F95063dB48A3C9560B"],
    "feeBurners": ["0x89B5c470559b80e541E53eF78244edD112c7C58A", "0x89B5c470559b80e541E53eF78244edD112c7C58A"],
    "workers": []
  },
  "logTopics": {
    "exchange": "0x1849bd6a030a1bca28b83437fd3de96f3d27a5d172fa7e9c78e7b61468928a39",
    "feeToWallet": "0x366bc34352215bf0bd3b527cfd6718605e1f5938777e42bcd8ed92f578368f52",
    "burnFee": "0xf838f6ddc89706878e3c3e698e9b5cbfbf2c0e3d3dcd0bd2e00f1ccf313e0185",
    "etherReceival": "0x75f33ed68675112c77094e7c5b073890598be1d23e27cd7f6907b4a7d98ac619",
    "erc20Transfer": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  },
  "tokens": {
    "ETH": {
      "name": "Ethereum",
      "symbol": "ETH",
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal": 18,
      "cmcId": "ethereum"
    },
    "KNC": {
      "name": "Kyber Network",
      "symbol": "KNC",
      "address": "0xE5585362D0940519d87d29362115D4cc060C56B3",
      "decimal": 18,
      "cmcId": "kyber-network",
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "address": "0x5b9a857e0C3F2acc5b94f6693536d3Adf5D6e6Be",
      "decimal": 18
    },
    "EOS": {
      "name": "EOS",
      "symbol": "EOS",
      "address": "0xd3c64BbA75859Eb808ACE6F2A6048ecdb2d70817",
      "decimal": 18,
      "delisted": true
    },
    "SNT": {
      "name": "Status Network",
      "address": "0xF739577d63cdA4a534B0fB92ABf8BBf6EA48d36c",
      "symbol": "SNT",
      "decimal": 18
    },
    "ELF": {
      "name": "AELF",
      "address": "0x7174FCb9C2A49c027C9746983D8262597b5EcCb1",
      "symbol": "ELF",
      "icon": "aelf.svg",
      "decimal": 18
    },
    "POWR": {
      "name": "Power Ledger",
      "address": "0x2C4EfAa21f09c3C6EEF0Edb001E9bffDE7127D3B",
      "symbol": "POWR",
      "icon": "pwr.svg",
      "decimal": 6
    },
    "MANA": {
      "name": "Decentraland",
      "address": "0xf5E314c435B3B2EE7c14eA96fCB3307C3a3Ef608",
      "symbol": "MANA",
      "decimal": 18
    },
    "BAT": {
      "name": "Basic Attention Token",
      "address": "0x04A34c8f5101Dcc50bF4c64D1C7C124F59bb988c",
      "symbol": "BAT",
      "decimal": 18
    },
    "REQ": {
      "name": "Request",
      "address": "0xa448cD1DB463ae738a171C483C56157d6B83B97f",
      "symbol": "REQ",
      "decimal": 18
    },
    "GTO": {
      "name": "GIFTO",
      "address": "0x6B07b8360832c6bBf05A39D9d443A705032bDc4d",
      "symbol": "GTO",
      "icon": "gifto.svg",
      "decimal": 5
    }
  },
  
  "averageBlockTime": 15000,
  "startBlockNumber": 5060595,
  "startBlockNumberV2": 10000000, // TODO: kyber 2.0 start block

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