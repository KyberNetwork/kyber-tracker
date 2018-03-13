module.exports = {
  "endpoints": {
    "web3Providers": [
      "https://mainnet.infura.io",
      "https://node.kyber.network",
      "https://mew.giveth.io/"
    ],
    "ws": "wss://mainnet.infura.io/ws",
    "cmcApi": "https://api.coinmarketcap.com",
    "ethScan": "https://etherscan.io/",
    "gasStation": "https://ethgasstation.info/json/ethgasAPI.json",
  },
  "contractAddresses": {
    "reserve": "0x63825c174ab367968ec60f061753d3bbd36a0d8f",
    "network": "0x964f35fae36d75b1e72770e244f6595b68508cf5",
    "wrapper": "0x533e6d1ffa2b96cf9c157475c76c38d1b13bc584",
    "feeBurner1": "0x4e89bc8484b2c454f2f7b25b612b648c45e14a8e",
    "feeBurner2": "0x07f6e905f2a1559cd9fd43cb92f8a1062a3ca706",
  },
  "logTopics": {
    "exchange": "0x1849bd6a030a1bca28b83437fd3de96f3d27a5d172fa7e9c78e7b61468928a39",
    "feeToWallet": "0x366bc34352215bf0bd3b527cfd6718605e1f5938777e42bcd8ed92f578368f52",
    "burnFee": "0xf838f6ddc89706878e3c3e698e9b5cbfbf2c0e3d3dcd0bd2e00f1ccf313e0185",
    "erc20Transfer": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  },
  "tokens": {
    "ETH": {
      "name": "Ethereum",
      "symbol": "ETH",
      "icon": "eth.svg",
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal": 18,
      "cmcId": "ethereum"
    },
    "KNC": {
      "name": "KyberNetwork",
      "symbol": "KNC",
      "icon": "knc.svg",
      "address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
      "decimal": 18,
      "cmcId": "kyber-network"
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "icon": "omg.svg",
      "address": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
      "decimal": 18,
      "cmcId": "omisego"
    },
    "EOS": {
      "name": "Eos",
      "symbol": "EOS",
      "icon": "eos.svg",
      "address": "0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0",
      "decimal": 18,
      "cmcId": "eos"
    },
    "SNT": {
      "name": "Status",
      "address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e",
      "symbol": "SNT",
      "icon": "snt.svg",
      "decimal": 18,
      "cmcId": "status"
    },
    "ELF": {
      "name": "Aelf",
      "address": "0xbf2179859fc6d5bee9bf9158632dc51678a4100e",
      "symbol": "ELF",
      "icon": "aelf.svg",
      "decimal": 18,
      "cmcId": "aelf"
    },
    "POWR": {
      "name": "Power Ledger",
      "address": "0x595832f8fc6bf59c85c527fec3740a1b7a361269",
      "symbol": "POWR",
      "icon": "pwr.svg",
      "decimal": 6,
      "cmcId": "power-ledger"
    },
    "MANA": {
      "name": "Mana",
      "address": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      "symbol": "MANA",
      "icon": "mana.svg",
      "decimal": 18,
      "cmcId": "decentraland"
    },
    "BAT": {
      "name": "Basic Attention Token",
      "address": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
      "symbol": "BAT",
      "icon": "bat.svg",
      "decimal": 18,
      "cmcId": "basic-attention-token"
    },
    "REQ": {
      "name": "Request",
      "address": "0x8f8221afbb33998d8584a2b05749ba73c37a938a",
      "symbol": "REQ",
      "icon": "req.svg",
      "decimal": 18,
      "cmcId": "request-network"
    },
    "GTO": {
      "name": "Gifto",
      "address": "0xc5bbae50781be1669306b9e001eff57a2957b09d",
      "symbol": "GTO",
      "icon": "gifto.svg",
      "decimal": 5,
      "cmcId": "gifto"
    },
    "RDN": {
      "name": "Raiden",
      "address": "0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6",
      "symbol": "RDN",
      "icon": "rdn.svg",
      "decimal": 18,
      "cmcId": "raiden-network-token"
    },
    "APPC": {
      "name": "AppCoins",
      "address": "0x1a7a8bd9106f2b8d977e08582dc7d24c723ab0db",
      "symbol": "APPC",
      "icon": "appc.svg",
      "decimal": 18,
      "cmcId": "appcoins"
    },
    "ENG": {
      "name": "Enigma",
      "address": "0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4",
      "symbol": "ENG",
      "icon": "eng.svg",
      "decimal": 8,
      "cmcId": "enigma-project"
    },
    "SALT": {
      "name": "Salt",
      "address": "0x4156d3342d5c385a87d264f90653733592000581",
      "symbol": "SALT",
      "icon": "salt.svg",
      "decimal": 8,
      "cmcId": "salt"
    },
    "BQX": {
      "name" : "Ethos",
      "address": "0x5af2be193a6abca9c8817001f45744777db30756",
      "symbol": "BQX",
      "decimal": 8,
      "icon": "bqx.svg",
      "cmcId":"ethos"
    }
  },
  "networkId": 1,
  "chainName": "Mainnet",
  "averageBlockTime": 15000,
  "startBlockNumber": 5049196, // From contract was deployed firstly #5049196
};
