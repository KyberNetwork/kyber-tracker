module.exports = {
  "endpoints": {
    "web3Provider": "https://mainnet.infura.io",
    "ethScan": "https://etherscan.io/",
    "getRate": "https://production-cache.kyber.network/getRate",
    "apis": "https://api.kyber.network"
  },
  "contractAddresses": {
    "wrapper": "0x6172AFC8c00c46E0D07ce3AF203828198194620a",
    "networks": ["0x964f35fae36d75b1e72770e244f6595b68508cf5", "0x818E6FECD516Ecc3849DAf6845e3EC868087B755"],
    "feeBurners": ["0x4e89bc8484b2c454f2f7b25b612b648c45e14a8e", "0x07f6e905f2a1559cd9fd43cb92f8a1062a3ca706", "0xed4f53268bfdFF39B36E8786247bA3A02Cf34B04", "0x52166528FCC12681aF996e409Ee3a421a4e128A3"],
    "workers": ["0x91a502C678605fbCe581eae053319747482276b9"],
    "internal": "0x9ae49C0d7F8F9EF4B864e004FE86Ac8294E20950"
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
    "address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
    "decimal": 18,
    "cmcId": "kyber-network",
    "cmcIdv2": "1982"
  },
  
  "tokens": {
    "ETH": {
      "name": "Ethereum",
      "symbol": "ETH",
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal": 18,
      "cmcId": "ethereum",
      "hidden": true
    },
    "KNC": {
      "name": "Kyber Network",
      "symbol": "KNC",
      "address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
      "decimal": 18,
      "cmcId": "kyber-network",
      "hidden": true
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "address": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
      "decimal": 18,
      "hidden": true
    },
    "EOS": {
      "name": "EOS",
      "symbol": "EOS",
      "address": "0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0",
      "decimal": 18,
      "delisted": true,
    },
    "SNT": {
      "name": "Status Network",
      "address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e",
      "symbol": "SNT",
      "decimal": 18,
      "hidden": true
    },
    "ELF": {
      "name": "AELF",
      "address": "0xbf2179859fc6d5bee9bf9158632dc51678a4100e",
      "symbol": "ELF",
      "decimal": 18,
      "hidden": true
    },
    "POWR": {
      "name": "Power Ledger",
      "address": "0x595832f8fc6bf59c85c527fec3740a1b7a361269",
      "symbol": "POWR",
      "decimal": 6,
      "hidden": true
    },
    "MANA": {
      "name": "Decentraland",
      "address": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      "symbol": "MANA",
      "decimal": 18,
      "hidden": true
    },
    "BAT": {
      "name": "Basic Attention Token",
      "address": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
      "symbol": "BAT",
      "decimal": 18,
      "hidden": true
    },
    "REQ": {
      "name": "Request",
      "address": "0x8f8221afbb33998d8584a2b05749ba73c37a938a",
      "symbol": "REQ",
      "decimal": 18,
      "hidden": true
    },
    "GTO": {
      "name": "GIFTO",
      "address": "0xc5bbae50781be1669306b9e001eff57a2957b09d",
      "symbol": "GTO",
      "decimal": 5,
      "hidden": true
    },
    "RDN": {
      "name": "Raiden Network",
      "address": "0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6",
      "symbol": "RDN",
      "decimal": 18,
      "hidden": true
    },
    "APPC": {
      "name": "AppCoins",
      "address": "0x1a7a8bd9106f2b8d977e08582dc7d24c723ab0db",
      "symbol": "APPC",
      "decimal": 18,
      "hidden": true
    },
    "ENG": {
      "name": "Enigma",
      "address": "0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4",
      "symbol": "ENG",
      "decimal": 8,
      "hidden": true
    },
    "SALT": {
      "name": "Salt",
      "address": "0x4156d3342d5c385a87d264f90653733592000581",
      "symbol": "SALT",
      "decimal": 8,
      "hidden": true
    },
    "BQX": {
      "name" : "ETHOS",
      "address": "0x5af2be193a6abca9c8817001f45744777db30756",
      "symbol": "BQX",
      "cmcSymbol": "ETHOS",
      "decimal": 8,
      "hidden": true
    },
    "ADX": {
      "name": "AdEx",
      "address": "0x4470BB87d77b963A013DB939BE332f927f2b992e",
      "decimal": 4,
      "symbol": "ADX",
      "hidden": true
    },
    "AST": {
      "name": "AirSwap",
      "decimal": 4,
      "address": "0x27054b13b1b798b345b591a4d22e6562d47ea75a",
      "symbol": "AST",
      "hidden": true
    },
    "RCN": {
      "name": "Ripio Credit Network",
      "decimal": 18,
      "address": "0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6",
      "symbol": "RCN",
      "hidden": true
    },
    "ZIL": {
      "name": "Zilliqa",
      "decimal": 12,
      "address": "0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27",
      "symbol": "ZIL",
      "hidden": true
    },
    "LINK": {
      "name": "Chain Link",
      "decimal": 18,
      "address": "0x514910771af9ca656af840dff83e8264ecf986ca",
      "symbol": "LINK",
      "hidden": true
    },
    "DAI": {
      "name": "Dai Stablecoin",
      "address": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      "symbol": "DAI",
      "decimal": 18,
      "hidden": true
    },
    "AION": {
      "name": "AION",
      "address": "0x4CEdA7906a5Ed2179785Cd3A40A69ee8bc99C466",
      "symbol": "AION",
      "decimal": 8,
      "delisted": true,
    },
    "SUB": {
      "name": "Substratum",
      "address": "0x12480e24eb5bec1a9d4369cab6a80cad3c0a377a",
      "symbol": "SUB",
      "decimal": 2,
      "hidden": 1531486800000,
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
      "hidden": 1540731600000
    },
    "DCC": {
      "name": "Distributed Credit Chain",
      "address": "0xffa93aacf49297d51e211817452839052fdfb961",
      "symbol": "DCC",
      "decimal": 18,
      "hidden": 1540731600000
    },
    "ENJ": {
      "name": "EnjinCoin",
      "address": "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      "symbol": "ENJ",
      "decimal": 18,
      "hidden": true
    },
    "DGX": {
      "name": "Digix Gold",
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
      "hidden": true,
    },
    "ELEC": {
      "name": "ElectrifyAsia",
      "address": "0xd49ff13661451313ca1553fd6954bd1d9b6e02b9",
      "symbol": "ELEC",
      "decimal": 18,
      "hidden": true
    },
    "IOST": {
      "name": "IOStoken",
      "address": "0xfa1a856cfa3409cfa145fa4e20eb270df3eb21ab",
      "symbol": "IOST",
      "decimal": 18,
      "hidden": true
    },
    "STORM": {
      "name": "Storm",
      "address": "0xd0a4b8946cb52f0661273bfbc6fd0e0c75fc6433",
      "symbol": "STORM",
      "decimal": 18,
      "hidden": true
    },
    "WAX": {
      "name": "Wax",
      "address": "0x39bb259f66e1c59d5abef88375979b4d20d98022",
      "symbol": "WAX",
      "decimal": 8,
      "hidden": true
    },
    "ABT": {
      "name": "ArcBlock",
      "address": "0xb98d4c97425d9908e66e53a6fdf673acca0be986",
      "symbol": "ABT",
      "decimal": 18,
      "hidden": true
    },
    "GVT": {
      "name": "Genesis Vision",
      "address": "0x103c3A209da59d3E7C4A89307e66521e081CFDF0",
      "symbol": "GVT",
      "decimal": 18,
      "hidden": true
    },
    "SRN": {
      "name": "SIRIN LABS Token",
      "address": "0x68d57c9a1c35f63e2c83ee8e49a64e9d70528d25",
      "symbol": "SRN",
      "decimal": 18,
      "hidden": true
    },
    "NAS": {
      "name": "Nebulas",
      "address": "0x5d65D971895Edc438f465c17DB6992698a52318D",
      "symbol": "NAS",
      "decimal": 18,
      "hidden": true
    },
    "QASH": {
      "name": "QASH",
      "address": "0x618e75ac90b12c6049ba3b27f5d5f8651b0037f6",
      "symbol": "QASH",
      "decimal": 6,
      "hidden": true
    },
    "BTM": {
      "name": "Bytom",
      "address": "0xcb97e65f07da24d46bcdd078ebebd7c6e6e3d750",
      "symbol": "BTM",
      "decimal": 8,
      "hidden": true
    },
    "AE": {
      "name": "Aeternity",
      "address": "0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d",
      "symbol": "AE",
      "decimal": 18,
      "hidden": true
    },
    "PPT": {
      "name": "Populous",
      "address": "0xd4fa1460f537bb9085d22c7bccb5dd450ef28e3a",
      "symbol": "PPT",
      "decimal": 8,
      "hidden": true
    },
    "CVC": {
      "name": "Civic",
      "address": "0x41e5560054824ea6b0732e656e3ad64e20e94e45",
      "symbol": "CVC",
      "decimal": 8,
      "hidden": true
    },
    "BLZ": {
      "name": "Bluzelle",
      "address": "0x5732046a883704404f284ce41ffadd5b007fd668",
      "symbol": "BLZ",
      "decimal": 18,
      "hidden": true
    },
    "REP": {
      "name": "Augur",
      "address": "0xe94327d07fc17907b4db788e5adf2ed424addff6",
      "symbol": "REP",
      "decimal": 18,
      "hidden": true
    },
    "LRC": {
      "name": "Loopring",
      "address": "0xef68e7c694f40c8202821edf525de3782458639f",
      "symbol": "LRC",
      "decimal": 18,
      "hidden": true
    },
    "PAL": {
      "name": "PolicyPal Network",
      "address": "0xfedae5642668f8636a11987ff386bfd215f942ee",
      "symbol": "PAL",
      "decimal": 18,
      "icon": "pal.png",
      "delisted": true
    },
    "COFI": {
      "name": "CoinFi",
      "address": "0x3136ef851592acf49ca4c825131e364170fa32b3",
      "symbol": "COFI",
      "decimal": 18,
      "hidden": true
    },
    "BBO": {
      "name": "Bigbom",
      "address": "0x84f7c44b6fed1080f647e354d552595be2cc602f",
      "symbol": "BBO",
      "decimal": 18,
      "hidden": true
    },
    "POLY": {
      "name": "Polymath",
      "address": "0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec",
      "symbol": "POLY",
      "decimal": 18,
      "hidden": true
    },
    "LBA": {
      "name": "Cred",
      "address": "0xfe5f141bf94fe84bc28ded0ab966c16b17490657",
      "symbol": "LBA",
      "decimal": 18,
      "hidden": true
    },
    "EDU": {
      "name": "EduCoin",
      "address": "0xf263292e14d9d8ecd55b58dad1f1df825a874b7c",
      "symbol": "EDU",
      "decimal": 18,
      "delisted": true
    },

    "POE": {
      "name": "Po.et",
      "address": "0x0e0989b1f9b8a38983c2ba8053269ca62ec9b195",
      "symbol": "POE",
      "decimal": 8,
      "hidden": true
    },
    "PAY": {
      "name": "TenX",
      "address": "0xB97048628DB6B661D4C2aA833e95Dbe1A905B280",
      "symbol": "PAY",
      "decimal": 18,
      "hidden": true
    },
    "CHAT": {
      "name": "Chatcoin",
      "address": "0x442bc47357919446eabc18c7211e57a13d983469",
      "symbol": "CHAT",
      "decimal": 18,
      "delisted": true,
    },
    "DTA": {
      "name": "Data",
      "address": "0x69b148395ce0015c13e36bffbad63f49ef874e03",
      "symbol": "DTA",
      "decimal": 18,
      "hidden": true
    },
    "BNT": {
      "name": "Bancor",
      "address": "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c",
      "symbol": "BNT",
      "decimal": 18,
      "hidden": true
    },
    "TUSD": {
      "name": "TrueUSD",
      "address": "0x8dd5fbce2f6a956c3022ba3663759011dd51e73e",
      "symbol": "TUSD",
      "decimal": 18,
      "hidden": true
    },
    "TOMO": {
      "name": "Tomocoin",
      "address": "0x8b353021189375591723E7384262F45709A3C3dC",
      "symbol": "TOMO",
      "decimal": 18,
      // "hidden": 1531486800000
      "delisted": true
    },

    "MDS": {
      "name": "MediShares",
      "address": "0x66186008C1050627F979d464eABb258860563dbE",
      "symbol": "MDS",
      "decimal": 18,
      // "hidden": 1532336400000
      "delisted": true   
    },
    "LEND": {
      "name": "EthLend",
      "address": "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03",
      "symbol": "LEND",
      "decimal": 18,
      "hidden": true
    },
    "WINGS": {
      "name": "Wings",
      "address": "0x667088b212ce3d06a1b553a7221E1fD19000d9aF",
      "symbol": "WINGS",
      "decimal": 18,
      "hidden": true
    },
    "MTL": {
      "name": "Metal",
      "address": "0xF433089366899D83a9f26A773D59ec7eCF30355e",
      "symbol": "MTL",
      "decimal": 8,
      "hidden": true
    },
    "WABI": {
      "name": "WaBi",
      "address": "0x286BDA1413a2Df81731D4930ce2F862a35A609fE",
      "symbol": "WABI",
      "decimal": 18,
      "hidden": true
    },
    "NULS": {
      "name": "Nuls",
      "address": "0xb91318f35bdb262e9423bc7c7c2a3a93dd93c92c",
      "symbol": "NULS",
      "decimal": 18,
      "hidden": true
    },
    "MOC": {
      "name": "Moss Land",
      "address": "0x865ec58b06bf6305b886793aa20a2da31d034e68",
      "symbol": "MOC",
      "decimal": 18,
      "hidden": true
    },
    "BITX": {
      "name": "BitScreenerToken",
      "symbol" : "BITX",
      "decimal": 18,
      "address": "0xff2b3353c3015E9f1FBF95B9Bda23F58Aa7cE007",
      "hidden": true
    },

    "BNB": {
      "name": "Binance",
      "symbol" : "BNB",
      "decimal": 18,
      "address": "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
      "hidden": true
    },
    "REP": {
      "name": "Augur",
      "symbol" : "REP",
      "decimal": 18,
      "address": "0x1985365e9f78359a9b6ad760e32412f4a445e862",
      "hidden": true
    },
    "ZRX": {
      "name": "0x",
      "symbol" : "ZRX",
      "decimal": 18,
      "address": "0xe41d2489571d322189246dafa5ebde1f4699f498",
      "hidden": true
    },

    "WETH": {
      "name": "Wrapped Ether",
      "symbol" : "WETH",
      "decimal": 18,
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "hidden": true
    },

    "MAS":{
      "name": "MidasProtocol",
      "symbol" : "MAS",
      "decimal": 18,
      "address": "0x23ccc43365d9dd3882eab88f43d515208f832430",   
      "hidden": true        
    },

    "KCC":{
      "name": "Kyber Community Coupon",
      "symbol" : "KCC",
      "decimal": 18,
      "address": "0x09677d0175dec51e2215426cddd055a71bf4228d",
      // "hidden": 1538205156429 
      "delisted": true      
    },

    "DAT":{
      "name": "Datum",
      "symbol" : "DAT",
      "decimal": 18,
      "address": "0x81c9151de0c8bafcd325a57e3db5a5df1cebf79c",
      "hidden": true      
    },
    "REN":{
      "name": "Republic",
      "symbol" : "REN",
      "decimal": 18,
      "address": "0x408e41876cccdc0f92210600ef50372656052a38",
      "hidden": true      
    },
    "QKC":{
      "name": "QuarkChain",
      "symbol" : "QKC",
      "decimal": 18,
      "address": "0xea26c4ac16d4a5a106820bc8aee85fd0b7b2b664",
      "hidden": 1539090000000       
    },

    "CNN":{
      "name": "CNN Token",
      "symbol" : "CNN",
      "decimal": 18,
      "address": "0x8713d26637CF49e1b6B4a7Ce57106AaBc9325343",
      "hidden": 1542027600000       
    },
    "SSP":{
      "name": "Smartshare Token",
      "symbol" : "SSP",
      "decimal": 4,
      "address": "0x624d520BAB2E4aD83935Fa503fB130614374E850",
      "hidden": 1542027600000       
    },
    "PRO":{
      "name": "Propy",
      "symbol" : "PRO",
      "decimal": 8,
      "address": "0x226bb599a12C826476e3A771454697EA52E9E220",
      "hidden": 1542027600000       
    },
    "OCN":{
      "name": "OCoin",
      "symbol" : "OCN",
      "decimal": 18,
      "address": "0x4092678e4E78230F46A1534C0fbc8fA39780892B",
      "hidden": 1542027600000       
    },
    
    "EKO":{
      "name": "EchoLink",
      "symbol" : "EKO",
      "decimal": 18,
      "address": "0xa6a840e50bcaa50da017b91a0d86b8b2d41156ee",
      "hidden": 1542027600000       
    },
    "HOT":{
      "name": "Hydro Protocol",
      "symbol" : "HOT",
      "decimal": 18,
      "address": "0x9af839687f6c94542ac5ece2e317daae355493a1",
      "hidden": true       
    },
    "OST":{
      "name": "Open Simple Token",
      "symbol" : "OST",
      "decimal": 18,
      "address": "0x2c4e8f2d746113d0696ce89b35f0d8bf88e0aeca",
      "hidden": 1542027600000       
    },


    "DTH":{
      "name": "Dether",
      "symbol" : "DTH",
      "decimal": 18,
      "address": "0x5adc961D6AC3f7062D2eA45FEFB8D8167d44b190",
      "hidden": 1542891600000       
    },
    "TVND":{
      "name": "TrueVND",
      "symbol" : "TVND",
      "decimal": 18,
      "address": "0x3Dc0501c32beE0cc1e629d590302A4b909797474",
      "hidden": true       
    },

    "WBTC":{
      "name": "	Wrapped BTC",
      "symbol" : "WBTC",
      "decimal": 8,
      "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "hidden": true       
    },

    "ABYSS":{
      "name": "ABYSS",
      "symbol" : "ABYSS",
      "decimal": 18,
      "address": "0x0E8d6b471e332F140e7d9dbB99E5E3822F728DA6",
      "hidden": true       
    },
    "PT":{
      "name": "Promotion Token",
      "symbol" : "PT",
      "decimal": 18,
      "address": "0x094c875704c14783049ddf8136e298b3a099c446",
      "hidden": 1543938161000       
    },

    "TTC":{
      "name": "TTC Protocol",
      "symbol" : "TTC",
      "decimal": 18,
      "address": "0x9389434852b94bbad4c8afed5b7bdbc5ff0c2275",
      "hidden": 1546088400000       
    },
    "INF":{
      "name": "InfinitusTokens",
      "symbol" : "INF",
      "decimal": 18,
      "address": "0x00e150d741eda1d49d341189cae4c08a73a49c95",
      "hidden": 1545048000000       
    }

  },

  "preburntAmount": 48.61873337,
  "averageBlockTime": 15000,
  "averageCGQuery": 13000,
  "startBlockNumber": 5060595,
  "startBlockNumberV2": 5926056,
  "rateBlockStepSize": 40,
  "newTokenDuration": 3 * 24 * 60 * 60 * 1000,

  "startPermissionlessReserveBlock": 7024980,

  "partners": {
    "olympus": "0x09227deaeE08a5Ba9D6Eb057F922aDfAd191c36c",
    "imtoken": "0xb9E29984Fe50602E7A619662EBED4F90D93824C7",
    "trust": "0xf1aa99c69715f423086008eb9d06dc1e35cc504d",
    "cipher": "0xDD61803d4a56C597E0fc864F7a20eC7158c6cBA5",
    "mew": "0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D",
    "dex": "0x398d297BAB517770feC4d8Bb7a4127b486c244bB",
    "easwap": "0xa7615cd307f323172331865181dc8b80a2834324"
  },

  "supportedLanguage": ["en", "vi", "ko", "zh"],
  "mappingLang_Moment": {
    "en" : "en",
    "vi" : "vi",
    "ko" : "ko",
    "zh" : "zh-cn"
  }
};
