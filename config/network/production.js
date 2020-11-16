module.exports = {
  "endpoints": {
    "web3Provider": "https://mainnet.infura.io",
    "ethScan": "https://etherscan.io/",
    "getRate": "https://production-cache.kyber.network/getRate",
    "apis": "https://api.kyber.network"
  },
  "contractAddresses": {
    "wrapper": "0x6172AFC8c00c46E0D07ce3AF203828198194620a",
    "networks": ["0x964f35fae36d75b1e72770e244f6595b68508cf5", "0x818E6FECD516Ecc3849DAf6845e3EC868087B755", "0x9AAb3f75489902f3a48495025729a0AF77d4b11e"],
    "feeBurners": ["0x4e89bc8484b2c454f2f7b25b612b648c45e14a8e", "0x07f6e905f2a1559cd9fd43cb92f8a1062a3ca706", "0xed4f53268bfdFF39B36E8786247bA3A02Cf34B04", "0x52166528FCC12681aF996e409Ee3a421a4e128A3", "0x8007aa43792a392b221dc091bdb2191e5ff626d1"],
    "feeHandler": ["0xd3d2b5643e506c6d9B7099E9116D7aAa941114fe"],
    "katalystStorage": "0xC8fb12402cB16970F3C5F4b48Ff68Eb9D1289301",
    "workers": ["0x91a502C678605fbCe581eae053319747482276b9"],
    "internal": ["0x9ae49C0d7F8F9EF4B864e004FE86Ac8294E20950", "0x65bf64ff5f51272f729bdcd7acfb00677ced86cd", "0x7C66550C9c730B6fdd4C03bc2e73c5462c5F7ACC"]
  },
  "logTopics": {
    "exchange": "0x1849bd6a030a1bca28b83437fd3de96f3d27a5d172fa7e9c78e7b61468928a39",
    "feeToWallet": "0x366bc34352215bf0bd3b527cfd6718605e1f5938777e42bcd8ed92f578368f52",
    "burnFee": "0xf838f6ddc89706878e3c3e698e9b5cbfbf2c0e3d3dcd0bd2e00f1ccf313e0185",
    "etherReceival": "0x75f33ed68675112c77094e7c5b073890598be1d23e27cd7f6907b4a7d98ac619",
    "erc20Transfer": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "burned": "0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5",
    "katalystBurned": "0xa0fcef56e2b45fcbeb91d5e629ef6b2b6e982d0768f02d1232610315cd23ea10",
    "kyberTrade": "0xd30ca399cb43507ecec6a629a35cf45eb98cda550c27696dcb0d8c4a3873ce6c",
    "feeDistributed": "0x53e2e1b5ab64e0a76fcc6a932558eba265d4e58c512401a7d776ae0f8fc08994",
    "katalystKyberTrade": "0x30bbea603a7b36858fe5e3ec6ba5ff59dde039d02120d758eacfaed01520577d",
    "katalystExecuteTrade": "0xf724b4df6617473612b53d7f88ecc6ea983074b30960a049fcd0657ffe808083",
    "katalystAddReserve": "0x50b2ce9e8f1a63ceaed262cc854dbf741b216e6429f7ba38403afbcdddc7f1ea",
    "kataLystRemoveReserve": "0xa5cd88a226efb041d6bdc0ac32964affd749b8a7c4d9e0c4ffba575e7180b1c9",
    "kataLystSetReserveWallet": "0x42cac9e63e37f62d5689493d04887a67fe3c68e1d3763c3f0890e1620a0465b3"
  },

  "ignoreReserveVolume": { 
    "0x57f8160e1c59d16c01bbe181fd94db4e56b60495": "WETH",
    "0x2295fc6bc32cd12fdbb852cff4014ceac6d79c10": "PT"
  },

  "blackListReserves": [
    "0x00cd2388c86c960a646d640be44fc8f83b78cec9",
    "0xbcedf929cdcb0858731ea8637c07efe6075b6138",
    "0x7a3370075a54b187d7bd5dcebf0ff2b5552d4f7d",
    "0x3480e12b6c2438e02319e34b4c23770679169190",
    "0x977c9abb01ed3e99e9953fd1f472ae9f459e7e70",
    "0x8ea5cf9f61824e8a3ca8aa370ab37e0202b2cc7d",
    "0x2c5a182d280eeb5824377b98cd74871f78d6b8bc"
  ],

  "reserves": {
    "0x9d27a2d71ac44e075f764d5612581e9afc1964fd": ["Orderbook"],
    "0xba92981e049a79de1b79c2396d48063e02f47239": ["Bancor hybrid"],
    "0x44aef3101432a64d1aa16388f4b9b352b09f42a9": ["Oasis hybrid"],
    "0x5d154c145db2ca90b8ab5e8fe3e716afa4ab7ff0": ["Uniswap hybrid"],
    "0x6f50e41885fdc44dbdf7797df0393779a9c0a3a6": ["Olympus"],
    "0x04A487aFd662c4F9DEAcC07A7B10cFb686B682A4": ["Oasis hybrid 2"],
    "0xcb57809435c66006d16db062c285be9e890c96fc": ["Virgil Capital"],
    "0xd6000fda0b38f4bff4cfab188e0bd18e8725a5e7": ["DutchX hybrid"],
    "0x45eb33d008801d547990caf3b63b4f8ae596ea57": ["REN APR"],
    "0x57f8160e1c59d16c01bbe181fd94db4e56b60495": ["WETH"],
    "0x3e9FFBA3C3eB91f501817b031031a71de2d3163B": ["ABYSS APR"],
    "0xa33c7c22d0bb673c2aea2c048bb883b679fa1be9": ["MLN APR"],
    "0x13032deb2d37556cf49301f713e9d7e1d1a8b169": ["Uniswap hybrid 2"],
    "0x5b756435bf2c8895bab3e3898dd7ed2ba073d7b9": ["Bancor hybrid 2"],
    "0xa9312cb86d1e532b7c21881ce03a1a9d52f6adb1": ["TTC"],
    "0x8463fDa3567D9228D6Bc2A9b6219fC85a19b89aa": ["Oasis hybrid 3"],
    "0x2295fc6BC32cD12fdBb852cFf4014cEAc6d79C10": ["PT"],
    "0x63825c174ab367968ec60f061753d3bbd36a0d8f": ["Kyber"],
    "0x35183769bbbf63d2b4cac32ef593f4ad08104fba": ["KCC"],
    "0x21433dec9cb634a23c6a4bbcce08c83f5ac2ec18": ["Prycto"],
    "0xfe4474d73be9307ebb5b5519dca19e8109286acb": ["Tomo"],
    "0x2631a5222522156dfafaa5ca8480223d6465782d": ["Dether"],
    "0x494696162d3c21b4b8ee08a7fcecc9b4a1dd1566": ["Tvnd"],
    "0xe0e1f00a2537eccdbb993929a4265658353affc6": ["Mossland"],
    "0x91be8fa21dc21cff073e07bae365669e154d6ee1": ["BBO APR", "APR"],
    "0xc97094dced8b43be3d275e725f41e63eba2d4cb6": ["Snap"],
    "0xb50b0d0ed29603c66c65c0582cf9e49b6a9e9da5": ["DCC"],
    "0x56e37b6b79d4e895618b8bb287748702848ae8c0": ["Midas"],
    "0x2aab2b157a03915c8a73adae735d0cf51c872f31": ["Prycto 2"],
    "0x742e8bb8e6bde9cb2df5449f8de7510798727fb1": ["Mossland 2"],
    "0xc935cad589bebd8673104073d5a5eccfe67fb7b1": ["CoinFi"],
    "0x582ea0af091ae0d98fdf08216cb2846711a65f6a": ["Kyber 2"],
    "0xe1213e46efcb8785b47ae0620a51f490f747f1da": ["Prycto 3"],
    "0x4d864b5b4f866f65f53cbaad32eb9574760865e6": ["Snap 2"],
    "0x5337d1df2d450945392d60b35f562b92fd96b6b6": ["ABYSS APR 2", "APR"],
    "0x9e2b650f890236ab49609c5a6b00cddb4e61f408": ["MKR, DAI"],
    "0x8bf5c569ecfd167f96fae6d9610e17571568a6a1": ["DAI"],
    "0x148332cd398321989f37803188b9a69fa32b133c": ["Kyber 3"],
    "0xA467b88BBF9706622be2784aF724C4B44a9d26F4": ["KNC APR", "APR"],
    "0x607d7751d9F4845C5a1dE9eeD39c56f4fC0F855d": ["KNC APR 2", "APR"],
    "0x1c802020eea688e2b05936cdb98b8e6894acc1c2": ["ABYSS APR 3", "APR"],
    "0x1670dfb52806de7789d5cf7d5c005cf7083f9a5d": ["USDC APR", "APR"],
    "0x485c4ec93d18ebd16623d455567886475ae28d04": ["WBTC APR", "APR"],
    "0x95f1f428485Bd41729938D620af61718Ea9B1F9E": ["Axe Capital"],
    "0xa107dfa919c3f084a7893a260b99586981beb528": ["SNX APR", "APR"],
    "0xcf1394c5e2e879969fdb1f464ce1487147863dcb": ["Oasis bridge - v2"],
    "0xAA14DCAA0AdbE79cBF00edC6cC4ED17ed39240AC": ["DAO stack APR", "APR"],
    "0xb45C8956a080d336934cEE52A35D4dbABF025b6F": ["MKR APR", "APR"],
    "0x05461124c86c0ad7c5d8e012e1499fd9109ffb7d": ["GNO APR", "APR"],
    "0x4Cb01bd05E4652CbB9F312aE604f4549D2bf2C99": ["Synth USD APR", "APR"],

    "0x54A4a1167B004b004520c605E3f01906f683413d": ["Uniswap bridge v3"],
    "0x3480e12b6c2438e02319e34b4c23770679169190": ["TKN APR", "APR"],
    "0x08030715560a146e306b87ca93fd618bb2a80363": ["BTU APR", "APR"],
    "0x751eea622edd1e3d768c18afbcaec7dce7750c65": ["RAE APR", "APR"],
    "0x1833ad67362249823515b59a8aa8b4f6b4358d1b": ["MYB APR", "APR"],

    "0x053aa84fcc676113a57e0ebb0bd1913839874be4": ["Bancor"],
    "0xa9742ee9a5407f4c2f8a49f65e3a440f3694960a": ["Santiment"],
    "0x7e2fd015616263add31a2acc2a437557cee80fc4": ["UPP"],
    "0xc6c8bce5e9383df025f982d6bbd84163957a6979": ["Nexxo"],
    "0x6b84dbd29643294703dbabf8ed97cdef74edd227": ["Sapien"],

    "0x1fe867bfe9cbe0045467605b959a355223e3885d": ["Bancor Bridge"],
    "0x31e085afd48a1d6e51cc193153d625e8f0514c7f": ["Uniswap bridge v4"],

    "0x1e158c0e93c30d24e918ef83d1e0be23595c3c0f": ["Oasis bridge v3"],
    "0x4f32bbe8dfc9efd54345fc936f9fef1048746fcf": ["OneBit Quant"],
    "0xfe06bc8bc12595c1c871ff7c2ea9cadc42735d7d": ["UniBright"],

    "0x00cd2388c86c960a646d640be44fc8f83b78cec9": ["2Key APR", "APR"],
    "0x9149c59f087e891b659481ed665768a57247c79e": ["WBTC APR2", "APR"],


    "0x10908c875d865c66f271f5d3949848971c9595c9": ["Katalyst Uniswap v2", "BR"],
    "0xcf76b605484cd4bd46237c05b7de98d538ff44ae": ["BZRX APR", "APR"],
    "0x0b798b89155ea31f1312791b9fdfaae7c5f48460": ["RSR APR", "APR"],
    "0xb89f41cd2c8b6cba8b851289198b06be8b4dec65": ["Origin Protocol APR", "APR"],
    "0x773a58c0ae122f56d6747bc1264f00174b3144c3": ["Quant APR", "APR"],
    "0x10db2a136ee3e0c963d82af4c86ca483199f2816": ["Kleros APR", "APR"],
    "0x89b3f60a17789aa7c7061af6f5e9efa407153c03": ["pNetwork PNT FPR", "APR"],
    "0xbfd3b2330b55a149de2440701948e6194fb8df2c": ["V-ID VIDT APR", "APR"],
    "0x0ce59e811024c4aa040389fb8917dd9edaef1693": ["Provable FPR", "APR"],
    "0x4c75da685109945d235c42151f9ec21162ee07be": ["MATIC APR", "APR"],
    "0xdd69d118a3c491e83dac93e751076c9f9b2a2c3f": ["Genesis Vision GVT APR", "APR"],
    "0x3e59c69952a4cfeaf653eedf8ff907d4b6b8762d": ["Selfkey APR", "APR"],
    "0xf0ca95b4fd623b0903f51f67d34b68186b31f706": ["renBTC APR", "APR"],
    "0x23fe3c603be19d3a1155766358071cacefe14537": ["Request Network APR", "APR"],
    "0xad84a44a673be4fdcd5e39ebd15ebc404e87f314": ["Cindicator CND APR", "APR"],
    "0x977c9abb01ed3e99e9953fd1f472ae9f459e7e70": ["AMPL APR", "APR"],
    "0x2ed6f2bc006da5897a0c3cd2686283c05e50c573": ["Metronome APR", "APR"],
    "0xfef329057b5a7084250ef98c6514f18897cbf858": ["KAI APR", "APR"],
    "0x5772f169ce6882c27dccab6bd632bc759e0c5525": ["RSV APR", "APR"],
    "0x84609cf708a82f97661db37f5f4d2a257d401d8e": ["Mooniswap bridge reserve", "BR"],
    "0x55a8fda671a257b80258d2a03abd6e0e1e3dbe79": ["SyncFab APR", "APR"],
    "0x248eaed12d307ef68a964fdfc4531637276fec14": ["Balancer Bridge V1", "BR"],
    "0x6d39cff1ef97c8f1e70d711e526e858a201315cd": ["OneBit FPR"],
    "0x12ba0823f29d674fbfe844e40f6ba54a07af44d7": ["SushiSwap Bridge"],
    "0x0994c18ed0c328f38d2c451b2a2e1ceb1ae6a812": ["ANT APR"],
    "0x69b87a139f3976912c1db7d0808a9fc7e3ca453f": ["Prycto FPR"],
    "0xd01ae36a911912a106445cc350be327344fbfefa": ["Uniswap-Sushiswap Bridge Reserve"],
    "0xeb74c8b319515593a26dab10a13f19872c2ecb02": ["Anonymous Reserve"]
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
    "address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
    "decimal": 18,
    "cmcId": "kyber-network",
    "cmcIdv2": "1982"
  },

  "WETH": {
    "name": "Wrapped Ether",
    "symbol" : "WETH",
    "decimal": 18,
    "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
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
      "cgId": "ethereum",
      "cmcId": "ethereum"
    },
    "KNC": {
      "name": "Kyber Network",
      "symbol": "KNC",
      "address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
      "decimal": 18,
      "cgId": "kyber-network",
      "cmcId": "kyber-network",
    },
    "OMG": {
      "name": "OmiseGO",
      "symbol": "OMG",
      "address": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
      "decimal": 18
    },
    "EOS": {
      "name": "EOS",
      "symbol": "EOS",
      "address": "0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0",
      "decimal": 18,
      "delisted": true
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
      "decimal": 18
    },
    "POWR": {
      "name": "Power Ledger",
      "address": "0x595832f8fc6bf59c85c527fec3740a1b7a361269",
      "symbol": "POWR",
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
      "decimal": 5,
      "delisted": true
    },
    "RDN": {
      "name": "Raiden Network",
      "address": "0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6",
      "symbol": "RDN",
      "decimal": 18,
      "delisted": true
    },
    "APPC": {
      "name": "AppCoins",
      "address": "0x1a7a8bd9106f2b8d977e08582dc7d24c723ab0db",
      "symbol": "APPC",
      "decimal": 18,
      "delisted": true
    },
    "ENG": {
      "name": "Enigma",
      "address": "0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4",
      "symbol": "ENG",
      "decimal": 8,
      "delisted": true
    },
    "SALT": {
      "name": "Salt",
      "address": "0x4156d3342d5c385a87d264f90653733592000581",
      "symbol": "SALT",
      "decimal": 8,
      "delisted": true
    },
    "BQX": {
      "name" : "ETHOS",
      "address": "0x5af2be193a6abca9c8817001f45744777db30756",
      "symbol": "BQX",
      "cmcSymbol": "ETHOS",
      "decimal": 8
    },
    "ADX": {
      "name": "AdEx",
      "address": "0x4470BB87d77b963A013DB939BE332f927f2b992e",
      "decimal": 4,
      "symbol": "ADX",
      "delisted": true
    },
    "AST": {
      "name": "AirSwap",
      "decimal": 4,
      "address": "0x27054b13b1b798b345b591a4d22e6562d47ea75a",
      "symbol": "AST",
      "delisted": true
    },
    "RCN": {
      "name": "Ripio Credit Network",
      "decimal": 18,
      "address": "0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6",
      "symbol": "RCN",
      "delisted": true
    },
    "ZIL": {
      "name": "Zilliqa",
      "decimal": 12,
      "address": "0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27",
      "symbol": "ZIL",
      "delisted": true
    },
    "LINK": {
      "name": "Chain Link",
      "decimal": 18,
      "address": "0x514910771af9ca656af840dff83e8264ecf986ca",
      "symbol": "LINK"
    },
    "SAI": {
      "name": "SAI Stablecoin",
      "address": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      "symbol": "SAI",
      "decimal": 18,
      "reserves": {
        "0x44aef3101432a64d1aa16388f4b9b352b09f42a9": '1'
      }
    },
    "DAI": {
      "name": "DAI Stablecoin",
      "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
      "symbol": "DAI",
      "decimal": 18
    },
    
    "AION": {
      "name": "AION",
      "address": "0x4CEdA7906a5Ed2179785Cd3A40A69ee8bc99C466",
      "symbol": "AION",
      "decimal": 8,
      "delisted": true
    },
    "SUB": {
      "name": "Substratum",
      "address": "0x12480e24eb5bec1a9d4369cab6a80cad3c0a377a",
      "symbol": "SUB",
      "decimal": 2,
      // "hidden": 1531486800000
      "delisted": true
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
      "address": "0xd4c435F5B09F855C3317c8524Cb1F586E42795fa",
      "symbol": "CND",
      "decimal": 18,
      "hidden": 1593522000000
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
      "hidden": 1540731600000,
      "delisted": true
    },
    "ENJ": {
      "name": "EnjinCoin",
      "address": "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      "symbol": "ENJ",
      "decimal": 18
    },
    "DGX": {
      "name": "Digix Gold",
      "address": "0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf",
      "symbol": "DGX",
      "decimal": 9
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
      "delisted": true
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
      "delisted": true
    },
    "IOST": {
      "name": "IOStoken",
      "address": "0xfa1a856cfa3409cfa145fa4e20eb270df3eb21ab",
      "symbol": "IOST",
      "decimal": 18
    },
    "STORM": {
      "name": "Storm",
      "address": "0xd0a4b8946cb52f0661273bfbc6fd0e0c75fc6433",
      "symbol": "STORM",
      "decimal": 18,
      // "hidden": 1583499600000
      "delisted": true
    },

    "LOOM": {
      "name": "Loom",
      "address": "0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0",
      "symbol": "LOOM",
      "decimal": 18,
      "hidden": 1583499600000
    },

    "WAX": {
      "name": "Wax",
      "address": "0x39bb259f66e1c59d5abef88375979b4d20d98022",
      "symbol": "WAX",
      "decimal": 8,
      // "hidden": 1531486800000
      "delisted": true
    },
    "ABT": {
      "name": "ArcBlock",
      "address": "0xb98d4c97425d9908e66e53a6fdf673acca0be986",
      "symbol": "ABT",
      "decimal": 18
    },
    "GVT": {
      "name": "Genesis Vision",
      "address": "0x103c3A209da59d3E7C4A89307e66521e081CFDF0",
      "symbol": "GVT",
      "decimal": 18,
      "hidden": 1599570000000
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
      "delisted": true
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
      "decimal": 8
    },
    "BLZ": {
      "name": "Bluzelle",
      "address": "0x5732046a883704404f284ce41ffadd5b007fd668",
      "symbol": "BLZ",
      "decimal": 18
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
      "hidden": 1533214800000,
      "delisted": true
    },
    "BBO": {
      "name": "Bigbom",
      "address": "0x84f7c44b6fed1080f647e354d552595be2cc602f",
      "symbol": "BBO",
      "decimal": 18,
      "delisted": true
    },
    "POLY": {
      "name": "Polymath",
      "address": "0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec",
      "symbol": "POLY",
      "decimal": 18
    },
    "LBA": {
      "name": "Cred",
      "address": "0xfe5f141bf94fe84bc28ded0ab966c16b17490657",
      "symbol": "LBA",
      "decimal": 18,
      "delisted": true
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
      "hidden": 1531486800000
    },
    "PAY": {
      "name": "TenX",
      "address": "0xB97048628DB6B661D4C2aA833e95Dbe1A905B280",
      "symbol": "PAY",
      "decimal": 18,
      "hidden": 1531486800000
    },
    "CHAT": {
      "name": "Chatcoin",
      "address": "0x442bc47357919446eabc18c7211e57a13d983469",
      "symbol": "CHAT",
      "decimal": 18,
      "delisted": true
    },
    "DTA": {
      "name": "Data",
      "address": "0x69b148395ce0015c13e36bffbad63f49ef874e03",
      "symbol": "DTA",
      "decimal": 18,
      // "hidden": 1531486800000
      "delisted": true
    },
    "BNT": {
      "name": "Bancor",
      "address": "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c",
      "symbol": "BNT",
      "decimal": 18,
      "hidden": 1531486800000,
      "reserves": {
        "0xba92981e049a79de1b79c2396d48063e02f47239": '1'
      }
    },
    "TUSD": {
      "name": "TrueUSD",
      // "address": "0x8dd5fbce2f6a956c3022ba3663759011dd51e73e",
      "address": "0x0000000000085d4780b73119b644ae5ecd22b376",
      "symbol": "TUSD",
      "decimal": 18,
      "hidden": 1531486800000
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
      "hidden": 1532336400000
    },
    "WINGS": {
      "name": "Wings",
      "address": "0x667088b212ce3d06a1b553a7221E1fD19000d9aF",
      "symbol": "WINGS",
      "decimal": 18,
      // "hidden": 1532336400000
      "delisted": true 
    },
    "MTL": {
      "name": "Metal",
      "address": "0xF433089366899D83a9f26A773D59ec7eCF30355e",
      "symbol": "MTL",
      "decimal": 8,
      "hidden": 1532336400000
    },


    "WABI": {
      "name": "WaBi",
      "address": "0x286BDA1413a2Df81731D4930ce2F862a35A609fE",
      "symbol": "WABI",
      "decimal": 18,
      "hidden": 1574427600000
      // "delisted": true 
    },
    "EDO": {
      "name": "Eidoo",
      "address": "0xced4e93198734ddaff8492d525bd258d49eb388e",
      "symbol": "EDO",
      "decimal": 18,
      "hidden": 1574427600000
      // "delisted": true 
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
      // "hidden": 1534417200000
      "delisted": true 
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
      "hidden": 1537590437000,
      "delisted": true
    },
    "REP": {
      "name": "Augur",
      "symbol" : "REP",
      "decimal": 18,
      "address": "0x1985365e9f78359a9b6ad760e32412f4a445e862",
      "hidden": 1537590437000
    },
    "ZRX": {
      "name": "0x",
      "symbol" : "ZRX",
      "decimal": 18,
      "address": "0xe41d2489571d322189246dafa5ebde1f4699f498",
      "hidden": 1537590437000
    },

    "WETH": {
      "name": "Wrapped Ether",
      "symbol" : "WETH",
      "decimal": 18,
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "hidden": 1536846367000,
    },

    "MAS":{
      "name": "MidasProtocol",
      "symbol" : "MAS",
      "decimal": 18,
      "address": "0x23ccc43365d9dd3882eab88f43d515208f832430",   
      "hidden": 1537963200000,
      "delisted": true           
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
      "hidden": 1539090000000       
    },
    "REN":{
      "name": "Republic",
      "symbol" : "REN",
      "decimal": 18,
      "address": "0x408e41876cccdc0f92210600ef50372656052a38",
      "hidden": 1539090000000       
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
      // "hidden": 1542027600000
      "delisted": true       
    },
    "SSP":{
      "name": "Smartshare Token",
      "symbol" : "SSP",
      "decimal": 4,
      "address": "0x624d520BAB2E4aD83935Fa503fB130614374E850",
      // "hidden": 1542027600000     
      "delisted": true   
    },
    "PRO":{
      "name": "Propy",
      "symbol" : "PRO",
      "decimal": 8,
      "address": "0x226bb599a12C826476e3A771454697EA52E9E220",
      // "hidden": 1542027600000    
      "delisted": true    
    },
    "OCN":{
      "name": "OCoin",
      "symbol" : "OCN",
      "decimal": 18,
      "address": "0x4092678e4E78230F46A1534C0fbc8fA39780892B",
      // "hidden": 1542027600000   
      "delisted": true     
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
      "hidden": 1542891600000,
      "delisted": true    
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
      "hidden": 1548853200000       
    },

    "ABYSS":{
      "name": "ABYSS",
      "symbol" : "ABYSS",
      "decimal": 18,
      "address": "0x0E8d6b471e332F140e7d9dbB99E5E3822F728DA6",
      "hidden": 1547557200000       
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
      "hidden": 1546088400000,
      "delisted": true    
    },
    "INF":{
      "name": "InfinitusTokens",
      "symbol" : "INF",
      "decimal": 18,
      "address": "0x00e150d741eda1d49d341189cae4c08a73a49c95",
      "hidden": 1545048000000,
      "delisted": true     
    },
    "USDC":{
      "name": "USD Coin",
      "symbol" : "USDC",
      "decimal": 6,
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "hidden": 1549976400000      
    },
    "GUSD":{
      "name": "Gemini dollar",
      "symbol" : "GUSD",
      "decimal": 2,
      "address": "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd",
      "hidden": true       
    },
    "EURS":{
      "name": "STASIS EURS Token",
      "symbol" : "EURS",
      "decimal": 2,
      "address": "0xdb25f211ab05b1c97d595516f45794528a807ad8",
      "hidden": 1549976400000       
    },
    "PAX":{
      "name": "Paxos Standard",
      "symbol" : "PAX",
      "decimal": 18,
      "address": "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
      "hidden": 1556542800000
    },

    "MLN":{
      "name": "Melon",
      "symbol" : "MLN",
      "decimal": 18,
      "address": "0xec67005c4E498Ec7f55E092bd1d35cbC47C91892",
      "hidden": 1549371981000       
    },

    "BIX":{
      "name": "BIX Token",
      "symbol" : "BIX",
      "decimal": 18,
      "address": "0xb3104b4b9da82025e8b9f8fb28b3553ce2f67069",
      // "hidden": 1549976400000
      "delisted": true       
    },
    "CDT":{
      "name": "CoinDash",
      "symbol" : "CDT",
      "decimal": 18,
      "address": "0x177d39ac676ed1c67a2b268ad7f1e58826e5b0af",
      "hidden": 1549976400000       
    },
    "UPP": {
      "name": "Sentinel Protocol",
      "symbol" : "UPP",
      "decimal": 18,
      "address": "0xc86d054809623432210c107af2e3f619dcfbf652",
      "hidden": 1563973200000
    },
    "MCO": {
      "name": "Crypto.com",
      "symbol" : "MCO",
      "decimal": 8,
      "address": "0xB63B606Ac810a52cCa15e44bB630fd42D8d1d83d",
      "hidden": 1556283600000  
    },

    "GNO": {
      "name": "Gnosis",
      "symbol" : "GNO",
      "decimal": 18,
      "address": "0x6810e776880c02933d47db1b9fc05908e5386b96",
      "hidden": 1560862800000  
    },

    "RLC": {
      "name": " iExec RLC",
      "symbol" : "RLC",
      "decimal": 9,
      "address": "0x607f4c5bb672230e8672085532f7e901544a7375",
      "hidden": 1560258000000 
    },
    "LRC": {
      "name": "LoopringCoin",
      "symbol" : "LRC",
      "decimal": 18,
      "address": "0xbbbbca6a901c926f240b89eacb641d8aec7aeafd",
      "hidden": 1560258000000 
    },
    "NPXS": {
      "name": "Pundi X",
      "symbol" : "NPXS",
      "decimal": 18,
      "address": "0xa15c7ebe1f07caf6bff097d8a589fb8ac49ae5b3",
      "hidden": 1560258000000,
      "delisted": true
    },
    "GEN": {
      "name": "DAOStack",
      "symbol" : "GEN",
      "decimal": 18,
      "address": "0x543ff227f64aa17ea132bf9886cab5db55dcaddf",
      "hidden": 1560258000000
    },

    "SPN": {
      "name": "Sapien",
      "symbol" : "SPN",
      "decimal": 6,
      "address": "0x20F7A3DdF244dc9299975b4Da1C39F8D5D75f05A",
      "hidden": 1562677200000
    },
    "BAM": {
      "name": "Bamboo",
      "symbol" : "BAM",
      "decimal": 18,
      "address": "0x22b3faaa8df978f6bafe18aade18dc2e3dfa0e0c",
      "hidden": 1562311830000
    },
    "MYB": {
      "name": "MyBit",
      "symbol" : "MYB",
      "decimal": 18,
      "address": "0x5d60d8d7ef6d37e16ebabc324de3be57f135e0bc",
      "hidden": 1562245200000
    },

    "EQUAD": {
      "name": "Quadrant Protocol",
      "symbol" : "EQUAD",
      "decimal": 18,
      "address": "0xC28e931814725BbEB9e670676FaBBCb694Fe7DF2",
      "hidden": 1563195600000
    },
    "CND": {
      "name": "Cindicator",
      "symbol" : "CND",
      "decimal": 18,
      "address": "0xd4c435f5b09f855c3317c8524cb1f586e42795fa",
      "hidden": 1565701200000
    },

    "USDT": {
      "name": "Tether USD",
      "decimal": 6,
      "symbol" : "USDT",
      "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "hidden": 1565960400000
    },
    "SNX": {
      "name": "Synthetix Network Token",
      "symbol" : "SNX",
      "decimal": 18,
      "address": "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
      "hidden": 1565960400000
    },



    "TKN": {
      "name": "Monolith",
      "symbol" : "TKN",
      "decimal": 8,
      "address": "0xaaaf91d9b90df800df4f55c205fd6989c977e73a",
      "hidden": 1569330000000
    },
    "BTU": {
      "name": "BTU Protocol",
      "symbol" : "BTU",
      "decimal": 18,
      "address": "0xb683d83a532e2cb7dfa5275eed3698436371cc9f",
      "hidden": 1569330000000
    },

    "RAE": {
      "name": "Receive Access Ecosystem",
      "symbol" : "RAE",
      "decimal": 18,
      "address": "0xe5a3229ccb22b6484594973a03a3851dcd948756",
      "hidden": 1573650000000
    },

    "SUSD": {
      "name": "Synth USD",
      "symbol" : "SUSD",
      "decimal": 18,
      "address": "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
      "hidden": 1574686800000
    },

    "SPIKE": {
      "name": "Spiking",
      "symbol" : "SPIKE",
      "decimal": 10,
      "address": "0xa7fc5d2453e3f68af0cc1b78bcfee94a1b293650",
      "hidden": 1575637200000
    },

    "SAN": {
      "name": "Santiment",
      "symbol" : "SAN",
      "decimal": 18,
      "address": "0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098",
      "hidden": 1575896400000
    },

    "USDS": {
      "name": "StableUSD",
      "symbol" : "USDS",
      "decimal": 6,
      "address": "0xa4bdb11dc0a2bec88d24a3aa1e6bb17201112ebe",
      "hidden": 1576328400000
    },

    "NEXXO": {
      "name": "Nexxo",
      "symbol" : "NEXXO",
      "decimal": 18,
      "address": "0x278a83b64c3e3e1139f8e8a52d96360ca3c69a3d",
      "hidden": 1576846800000
    },

    "EKG": {
      "name": "Ekon Gold",
      "symbol" : "EKG",
      "decimal": 18,
      "address": "0x6a9b3e36436b7abde8c4e2e2a98ea40455e615cf",
      "hidden": 1577970000000
    },

    "ANT": {
      "name": "Aragon",
      "symbol" : "ANT",
      "decimal": 18,
      "address": "0x960b236A07cf122663c4303350609A66A7B288C0",
      "hidden": 1578488400000
    },

    "GDC": {
      "name": "Global Digital Content",
      "symbol" : "GDC",
      "decimal": 18,
      "address": "0x301C755bA0fcA00B1923768Fffb3Df7f4E63aF31",
      "hidden": 1579611600000
    },

    "AMPL": {
      "name": "Ampleforth",
      "symbol" : "AMPL",
      "decimal": 9,
      "address": "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
      "hidden": 1580389200000
    },

    "TKX": {
      "name": "Tokenize Xchange",
      "symbol" : "TKX",
      "decimal": 8,
      "address": "0x667102BD3413bFEaa3Dffb48fa8288819E480a88",
      "hidden": 1580994000000
    },

    "MET": {
      "name": "Metronome",
      "symbol" : "MET",
      "decimal": 18,
      "address": "0xa3d58c4e56fedcae3a7c43a725aee9a71f0ece4e",
      "hidden": 1581944400000
    },

    "MFG": {
      "name": "SyncFab Smart Manufacturing Blockchain",
      "symbol" : "MFG",
      "decimal": 18,
      "address": "0x6710c63432A2De02954fc0f851db07146a6c0312",
      "hidden": 1582203600000
    },
    "FXC": {
      "name": "Flexacoin",
      "symbol" : "FXC",
      "decimal": 18,
      "address": "0x4a57E687b9126435a9B19E4A802113e266AdeBde",
      "hidden": 1582808400000
    },

    "UBT": {
      "name": "UniBright",
      "symbol" : "UBT",
      "decimal": 8,
      "address": "0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e",
      "hidden": 1583154000000
    },

    "PBTC": {
      "name": "Provable BTC",
      "symbol" : "PBTC",
      "decimal": 18,
      "address": "0x5228a22e72ccc52d415ecfd199f99d0665e7733b",
      "hidden": 1583758800000
    },
    "OGN": {
      "name": "Origin Protocol",
      "symbol" : "OGN",
      "decimal": 18,
      "address": "0x8207c1ffc5b6804f6024322ccf34f29c3541ae26",
      "hidden": 1584018000000
    },

    "BAND": {
      "name": "Band Protocol",
      "symbol" : "BAND",
      "decimal": 18,
      "address": "0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55",
      "hidden": 1586264400000
    },

    "RSV": {
      "name": "Reserve",
      "symbol" : "RSV",
      "decimal": 18,
      "address": "0x1c5857e110cd8411054660f60b5de6a6958cfae2",
      "hidden": 1586782800000
    },
    "RSR": {
      "name": "Reserve Rights",
      "symbol" : "RSR",
      "decimal": 18,
      "address": "0x8762db106b2c2a0bccb3a80d1ed41273552616e8",
      "hidden": 1586782800000
    },

    "PNK": {
      "name": "Kleros",
      "symbol" : "PNK",
      "decimal": 18,
      "address": "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d",
      "hidden": 1587646800000
    },

    "GHT": {
      "name": "Global Human Trust",
      "symbol" : "GHT",
      "decimal": 18,
      "address": "0xbe30f684d62c9f7883a75a29c162c332c0d98f23",
      "hidden": 1588683600000
    },

    "TRYB": {
      "name": "BiLira",
      "symbol" : "TRYB",
      "decimal": 6,
      "address": "0x2c537e5624e4af88a7ae4060c022609376c8d0eb",
      "hidden": 1589203200000
    },
    "2KEY": {
      "name": "TwoKeyEconomy",
      "symbol" : "2KEY",
      "decimal": 18,
      "address": "0xE48972fCd82a274411c01834e2f031D4377Fa2c0",
      "hidden": 1589893200000
    },

    "PLR": {
      "name": "Pillar",
      "symbol" : "PLR",
      "decimal": 18,
      "address": "0xe3818504c1b32bf1557b16c238b2e01fd3149c17",
      "hidden": 1589979600000
    },

    "BUSD": {
      "name": "Binance USD",
      "symbol" : "BUSD",
      "decimal": 18,
      "address": "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      "hidden": 1590584400000
    },

    "QNT": {
      "name": "Quant",
      "symbol" : "QNT",
      "decimal": 18,
      "address": "0x4a220e6096b25eadb88358cb44068a3248254675",
      "hidden": 1591016400000
    },

    "PNT": {
      "name": "pNetwork Token",
      "symbol" : "PNT",
      "decimal": 18,
      "address": "0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD",
      "hidden": 1592917200000
    },

    "COMP": {
      "name": "Compound",
      "symbol" : "COMP",
      "decimal": 18,
      "address": "0xc00e94cb662c3520282e6f5717214004a7f26888",
      "hidden": 1593608400000
    },

    "BZRX": {
      "name": "bZx Protocol Token",
      "symbol" : "BZRX",
      "decimal": 18,
      "address": "0x56d811088235f11c8920698a204a5010a788f4b3",
    },

    "RENBTC": {
      "name": "renBTC",
      "symbol" : "RENBTC",
      "decimal": 8,
      "address": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
    },

    "VIDT": {
      "name": "V-ID blockchain",
      "symbol" : "VIDT",
      "decimal": 18,
      "address": "0xfef4185594457050cc9c23980d301908fe057bb1",
      "hidden": 1596114000000
    },

    "PLTC": {
      "name": "pTokens LTC",
      "symbol" : "PLTC",
      "decimal": 18,
      "address": "0x5979F50f1D4c08f9A53863C2f39A7B0492C38d0f",
      "hidden": 1596459600000
    },

    "KAI": {
      "name": "KardiaChain",
      "symbol" : "KAI",
      "decimal": 18,
      "address": "0xbd6467a31899590474ce1e84f70594c53d628e46",
      "hidden": 1596632400000
    },

    "REPv2": {
      "name": "Reputation",
      "symbol" : "REPv2",
      "decimal": 18,
      "address": "0x221657776846890989a759ba2973e427dff5c9bb",
      "hidden": 1596718800000
    },

    "STMX": {
      "name": "StormX",
      "symbol" : "STMX",
      "decimal": 18,
      "address": "0xbe9375c6a420d2eeb258962efb95551a5b722803",
      "hidden": 1596718800000
    },

    "MATIC": {
      "name": "MATIC Token",
      "symbol" : "MATIC",
      "decimal": 18,
      "address": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      "hidden": 1598446800000
    },

    "HUSD": {
      "name": "HUSD",
      "symbol" : "HUSD",
      "decimal": 8,
      "address": "0xdf574c24545e5ffecb9a659c229253d4111d87e1",
    },

    "KEY": {
      "name": "SelfKey",
      "symbol" : "KEY",
      "decimal": 18,
      "address": "0x4cc19356f2d37338b9802aa8e8fc58b0373296e7",
    },

    "RSV": {
      "name": "Reserve",
      "symbol" : "RSV",
      "decimal": 18,
      "address": "0x196f4727526ea7fb1e17b2071b3d8eaa38486988",
    },

    "UNI": {
      "name": "UNI",
      "symbol" : "UNI",
      "decimal": 18,
      "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    },


    "YFI": {
      "name": "yearn.finance",
      "symbol" : "YFI",
      "decimal": 18,
      "address": "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e"
    },
    "CREAM": {
      "name": "Cream",
      "symbol" : "CREAM",
      "decimal": 18,
      "address": "0x2ba592F78dB6436527729929AAf6c908497cB200"
    },
    "UNI": {
      "name": "Uniswap",
      "symbol" : "UNI",
      "decimal": 18,
      "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
    },
    "YFV": {
      "name": "YFValue",
      "symbol" : "YFV",
      "decimal": 18,
      "address": "0x45f24BaEef268BB6d63AEe5129015d69702BCDfa"
    },
    "SWRV": {
      "name": "Swerve DAO Token",
      "symbol" : "SWRV",
      "decimal": 18,
      "address": "0xB8BAa0e4287890a5F79863aB62b7F175ceCbD433"
    },
    "CRV": {
      "name": "Curve DAO Token",
      "symbol" : "CRV",
      "decimal": 18,
      "address": "0xD533a949740bb3306d119CC777fa900bA034cd52"
    },
    "SUSHI": {
      "name": "SushiToken",
      "symbol" : "SUSHI",
      "decimal": 18,
      "address": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
    },
    "KAI": {
      "name": "KardiaChain",
      "symbol" : "KAI",
      "decimal": 18,
      "address": "0xd9ec3ff1f8be459bb9369b4e79e9ebcf7141c093"
    },
    "SAND": {
      "name": "The Sandbox",
      "symbol" : "SAND",
      "decimal": 18,
      "address": "0x3845badade8e6dff049820680d1f14bd3903a5d0"
    },
    "VALOR": {
      "name": "Smart Valor",
      "symbol" : "VALOR",
      "decimal": 18,
      "address": "0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a"
    },
    "AAVE": {
      "name": "Aave",
      "symbol" : "AAVE",
      "decimal": 18,
      "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      "hidden": 1603285200000
    },
    "OCEAN": {
      "name": "Ocean Protocol",
      "symbol" : "OCEAN",
      "decimal": 18,
      "address": "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
      "hidden": 1603285200000
    },

    "IND": {
      "name": "Indorse Token",
      "symbol" : "IND",
      "decimal": 18,
      "address": "0xf8e386eda857484f5a12e4b5daa9984e06e73705",
      "hidden": 1603717200000
    },

    "FUSE": {
      "name": "Fuse Network Token",
      "symbol" : "FUSE",
      "decimal": 18,
      "address": "0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d",
      "hidden": 1603803600000
    },

    "ALEPH": {
      "name": "Aleph",
      "symbol" : "ALEPH",
      "decimal": 18,
      "address": "0x27702a26126e0b3702af63ee09ac4d1a084ef628",
      "hidden": 1603976400000
    },
  },

  "preburntAmount": 48.61873337,
  "averageBlockTime": 15000,
  "averageCGQuery": 13000,
  "startBlockNumber": 5060595,
  "rateStartBlockNumber": 5500000,
  "startBlockNumberV2": 5926056,
  "rateBlockStepSize": 40,
  "newTokenDuration": 3 * 24 * 60 * 60 * 1000,

  "startPermissionlessReserveBlock": 7024980,
  "startKataLystBlock": 10403237,

  "partners": {
    "olympus": "0x09227deaeE08a5Ba9D6Eb057F922aDfAd191c36c",
    "imtoken": "0xb9E29984Fe50602E7A619662EBED4F90D93824C7",
    "trust": "0xf1aa99c69715f423086008eb9d06dc1e35cc504d",
    "cipher": "0xDD61803d4a56C597E0fc864F7a20eC7158c6cBA5",
    "mew": "0x4247951c2eb6d0bA38d233fe7d542c8c80c9d46A",
    "dex": "0x398d297BAB517770feC4d8Bb7a4127b486c244bB",
    "easwap": "0xa7615cd307f323172331865181dc8b80a2834324",
    "kyberswap": "0x440bBd6a888a36DE6e2F6A25f65bc4e16874faa9",
    "1inch":"0x4D37f28D2db99e8d35A6C725a5f1749A085850a3",
    "argent": "0xa5c603e1C27a96171487aea0649b01c56248d2e8",
    "nuo": "0xF12c4E73868a4A028382AC51b57482b627A323d2",
    "instadapp": "0x7284a8451d9a0e7Dc62B3a71C0593eA2eC5c5638",
    "enjin": "0xdE63aef60307655405835DA74BA02CE4dB1a42Fb",
    "fulcrum": "0x13ddAC8d492E463073934E2a101e419481970299",
    "betoken": "0x332D87209f7c8296389C307eAe170c2440830A47"
  },

  "dapps": {
    "0xf89220007d9280f97fa44c8bb82efbdecc39063a": "Fulcrum",
    "0xde63aef60307655405835da74ba02ce4db1a42fb": "Enjin",
    "0xb9e29984fe50602e7a619662ebed4f90d93824c7": "ImToken",
    "0xb21090c8f6bac1ba614a3f529aae728ea92b6487": "Multis",
    "0xa7615cd307f323172331865181dc8b80a2834324": "Easwap",
    "0xa6bc6df9eba23abff0d1ecd6c9847893d2b1643d": "CoinManager",
    "0xa5c603e1c27a96171487aea0649b01c56248d2e8": "Argent",
    "0xf7075e232b34e57ca3bb91980b97c4f8a20d7ee4": "CoinGecko",
    "0xf257246627f7cb036ae40aa6cfe8d8ce5f0eba63": "Fulcrum",
    "0xf1aa99c69715f423086008eb9d06dc1e35cc504d": "Trust",
    "0xf12c4e73868a4a028382ac51b57482b627a323d2": "Nuo",
    "0xec1e3dc16ee138991e105dfa3230f1c9d607a6d0": "Fulcrum",
    "0xea1a7de54a427342c8820185867cf49fc2f95d43": "KyberSwap Non-EU",
    "0xe2d8481eef31cda994833974fffeccd576f8d71e": "Ledger Live",
    "0xdecaf9cd2367cdbb726e904cd6397edfcae6068d": "Myetherwallet",
    "0xdd61803d4a56c597e0fc864f7a20ec7158c6cba5": "Cipher",
    "0xc9d81352fbdb0294b091e51d774a0652ef776d99": "Unknown Arbitrage Bot",
    "0xb4700da07508553877a81a9a2f40a872de788cfe": "Fulcrum",
    "0x9a68f7330a3fe9869ffaee4c3cf3e6bbef1189da": "KyberSwap iOS",
    "0x9e1c71c25111f4ca7b40c956c8a21b6ac2f02274": "Fulcrum",
    "0x92afb508a46494ac00a242627703d1f21ca2df1b": "Fulcrum",
    "0x7a342739f58a55a3a01efea152efd95e8e96ef70": "Fulcrum",
    "0x7284a8451d9a0e7dc62b3a71c0593ea2ec5c5638": "Instadapp",
    "0x71c7656ec7ab88b098defb751b7401b5f6d8976f": "Etherscan",
    "0x673d26360af6688fdd9d788677fd06f58aad5b4d": "Midas",
    "0x440bbd6a888a36de6e2f6a25f65bc4e16874faa9": "KyberSwap",
    "0x4247951c2eb6d0ba38d233fe7d542c8c80c9d46a": "MEW",
    "0x398d297bab517770fec4d8bb7a4127b486c244bb": "Dex wallet",
    "0x332d87209f7c8296389c307eae170c2440830a47": "Betoken",
    "0x322d58b9e75a6918f7e7849aee0ff09369977e08": "CDP saver",
    "0x25e3d9b98a4dea9809b65045d1f007335032edd4": "Infinito (IBL)",
    "0x21357b3dcb7ae07da23a708dbbd9a2340001a3f4": "LinkTime",
    "0x1bf3e7ede31dbb93826c2af8686f80ac53f9ed93": "ipfswap.com",
    "0x1a719375e9b8b056c5492fdf7bad9bf5a2f79cc2": "Altitude games",
    "0x13ddac8d492e463073934e2a101e419481970299": "Fulcrum",
    "0x09227deaee08a5ba9d6eb057f922adfad191c36c": "OlympusLab",
    "0x087ac7736469716d73498e479e09119a02d7a59d": "Opyn",
    "0x03e0635a77ca3dbc23748af10a568663964f4bad": "Fulcrum",
    "0x3ffff2f4f6c0831fac59534694acd14ac2ea501b": "KyberSwap Android",
    "0x4d37f28d2db99e8d35a6c725a5f1749a085850a3": "1inch.exchange",
  },

  "supportedLanguage": ["en", "vi", "ko", "zh"],
  "mappingLang_Moment": {
    "en": "en",
    "vi": "vi",
    "ko": "ko",
    "zh": "zh-cn"
  }
};
