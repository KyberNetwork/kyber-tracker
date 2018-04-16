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
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal": 18,
      "cmcId": "ethereum"
    },
    "KNC": {
      "name": "Kyber Network",
      "symbol": "KNC",
      "address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
      "decimal": 18
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "address": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
      "decimal": 18
    },
    "EOS": {
      "name": "Eos",
      "symbol": "EOS",
      "address": "0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0",
      "decimal": 18
    },
    "SNT": {
      "name": "Status Network",
      "address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e",
      "symbol": "SNT",
      "decimal": 18
    },
    "ELF": {
      "name": "AELF",
      "address": "0xbf2179859fc6d5bee9bf9158632dc51678a4100e",
      "symbol": "ELF",
      "icon": "aelf.svg",
      "decimal": 18
    },
    "POWR": {
      "name": "Power Ledger",
      "address": "0x595832f8fc6bf59c85c527fec3740a1b7a361269",
      "symbol": "POWR",
      "icon": "pwr.svg",
      "decimal": 6
    },
    "MANA": {
      "name": "Decentraland",
      "address": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      "symbol": "MANA",
      "decimal": 18
    },
    "BAT": {
      "name": "Basic Attention Token",
      "address": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
      "symbol": "BAT",
      "decimal": 18
    },
    "REQ": {
      "name": "Request",
      "address": "0x8f8221afbb33998d8584a2b05749ba73c37a938a",
      "symbol": "REQ",
      "decimal": 18
    },
    "GTO": {
      "name": "GIFTO",
      "address": "0xc5bbae50781be1669306b9e001eff57a2957b09d",
      "symbol": "GTO",
      "icon": "gifto.svg",
      "decimal": 5
    },
    "RDN": {
      "name": "Raiden Network",
      "address": "0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6",
      "symbol": "RDN",
      "decimal": 18
    },
    "APPC": {
      "name": "AppCoins",
      "address": "0x1a7a8bd9106f2b8d977e08582dc7d24c723ab0db",
      "symbol": "APPC",
      "decimal": 18
    },
    "ENG": {
      "name": "Enigma",
      "address": "0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4",
      "symbol": "ENG",
      "decimal": 8
    },
    "SALT": {
      "name": "Salt",
      "address": "0x4156d3342d5c385a87d264f90653733592000581",
      "symbol": "SALT",
      "decimal": 8
    },
    "BQX": {
      "name" : "ETHOS",
      "address": "0x5af2be193a6abca9c8817001f45744777db30756",
      "symbol": "BQX",
      "decimal": 8
    },
    "ADX": {
      "name": "AdEx",
      "address": "0x4470BB87d77b963A013DB939BE332f927f2b992e",
      "decimal": 4,
      "symbol": "ADX"
    },
    "AST": {
      "name": "AirSwap",
      "decimal": 4,
      "address": "0x27054b13b1b798b345b591a4d22e6562d47ea75a",
      "symbol": "AST"
    },
    "RCN": {
      "name": "Ripio Credit Network",
      "decimal": 18,
      "address": "0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6",
      "symbol": "RCN" 
    },
    "ZIL": {
      "name": "Zilliqa",
      "decimal": 12,
      "address": "0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27",
      "symbol": "ZIL"
    },
    "LINK": {
      "name": "Chain Link",
      "decimal": 18,
      "address": "0x514910771af9ca656af840dff83e8264ecf986ca",
      "symbol": "LINK"  
    },
    "DAI": {
      "name": "Dai Stablecoin",
      "address": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      "symbol": "DAI",
      "decimal": 18
    },
    "AION": {
      "name": "AION",
      "address": "0x4CEdA7906a5Ed2179785Cd3A40A69ee8bc99C466",
      "symbol": "AION",
      "decimal": 8,
      "hidden": true
    },
    "SUB": {
      "name": "Substratum",
      "address": "0x12480e24eb5bec1a9d4369cab6a80cad3c0a377a",
      "symbol": "SUB",
      "decimal": 2,
      "hidden": true
    },
    "STORJ": {
      "name": "Storj",
      "address": "0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac",
      "symbol": "STORJ",
      "decimal": 8,
      "hidden": true
    },
    "CND": {
      "name": "Cindicator",
      "address": "0xd4c435f5b09f855c3317c8524cb1f586e42795fa",
      "symbol": "CND",
      "decimal": 18,
      "hidden": true
    },
    "KIN": {
      "name": "Kin",
      "address": "0x818fc6c2ec5986bc6e2cbf00939d90556ab12ce5",
      "symbol": "KIN",
      "decimal": 18,
      "hidden": true
    },
    "DENT": {
      "name": "DENT",
      "address": "0x3597bfd533a99c9aa083587b074434e61eb0a258",
      "symbol": "DENT",
      "decimal": 8,
      "hidden": true
    },
    "TRX": {
      "name": "Tronix",
      "address": "0xf230b790e05390fc8295f4d3f60332c93bed42e2",
      "symbol": "TRX",
      "decimal": 6,
      "hidden": true
    },
    "MKR": {
      "name": "Maker",
      "address": "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      "symbol": "MKR",
      "decimal": 18,
      "hidden": true
    },
    "ENJ": {
      "name": "EnjinCoin",
      "address": "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      "symbol": "ENJ",
      "decimal": 18,
      "hidden": true
    },
    "DGX": {
      "name": "Digix Gold Token",
      "address": "0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf",
      "symbol": "DGX",
      "decimal": 9,
      "hidden": true
    },
    "DGD": {
      "name": "DigixDAO",
      "address": "0xe0b7927c4af23765cb51314a0e0521a9645f0e2a",
      "symbol": "DGD",
      "decimal": 9,
      "hidden": true
    },
    "VEN": {
      "name": "VeChain",
      "address": "0xd850942ef8811f2a866692a623011bde52a462c1",
      "symbol": "VEN",
      "decimal": 18,
      "hidden": true
    },
    "MOT": {
      "name": "Olympus Labs",
      "address": "0x263c618480dbe35c300d8d5ecda19bbb986acaed",
      "symbol": "MOT",
      "decimal": 18,
      "hidden": true
    },
    "ICX": {
      "name": "ICON",
      "address": "0xb5a5f22694352c15b00323844ad545abb2b11028",
      "symbol": "ICX",
      "decimal": 18,
      "hidden": true
    },
    "ELEC": {
      "name": "ElectrifyAsia",
      "address": "0xd49ff13661451313ca1553fd6954bd1d9b6e02b9",
      "symbol": "ELEC",
      "decimal": 18,
      "hidden": true
    }
  },
  "networkId": 1,
  "chainName": "Mainnet",
  "averageBlockTime": 15000,
  "startBlockNumber": 5049196, // From contract was deployed firstly #5049196
};