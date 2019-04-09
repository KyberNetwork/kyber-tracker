# Document for Kyber Tracker apis

## api

#### '/api/trades'  
ex: /api/trades?limit=20&page=0&symbol=ETH&official=false

(GET) returns a list of trades between a time range

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|symbol|STRING|NO| Symbol of currency. If `null` will return all trades of all tokens with Kyber Network contract|
|page|INT|YES|Start from 0. Default is value `0`. The page index of the response data. Each page includes maximum 1000 records.|
|limit|INT|NO| Limit number of trades each page. (default is `20`)|
|fromDate|INT|NO| Limit start time of trades in ms. If `null` will return all trades from blockno 5060595|
|toDate|INT|NO| Limit end time of trades in ms. If `null` will return all trades to current block|
|offcial|BOOL|NO| true or false (default is true). If `false` will return all trades of all tokens (offical and unoffical trades), if `true` will return only offical|

Response:
```javascript
{
  "meta": {
    "code": 0,
    "serverTime": 1548055768103,
    "masterdataVersion": 1
  },
  "data": [
    {
      "id": 141861,
      "blockNumber": 7102657,
      "blockHash": "0x3f21b003a8d4e69025c4e873ba081fbda45b3e9414eb68e02a615e0c7130e296",
      "blockTimestamp": 1548055567,
      "tx": "0xfb29f46d07edac1ae6b4d65e529225b61193a187c9ce91a82b59091569c32b8b",
      "uniqueTag": "0xfb29f46d07edac1ae6b4d65e529225b61193a187c9ce91a82b59091569c32b8b_log_5210af96",
      "sourceOfficial": 1,
      "destOfficial": 0,
      "sourceReserve": "0x44aef3101432a64d1aa16388f4b9b352b09f42a9",
      "destReserve": "0x13032deb2d37556cf49301f713e9d7e1d1a8b169",
      "makerAddress": "0x283Fd8BEFbef1B0e8B9F0C707a17F8c4885bFd46",
      "makerTokenAddress": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      "makerTokenSymbol": "MKR",
      "makerTokenAmount": "85797403007823927",
      "takerAddress": "0x283Fd8BEFbef1B0e8B9F0C707a17F8c4885bFd46",
      "takerTokenAddress": "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359",
      "takerTokenSymbol": "DAI",
      "takerTokenAmount": "37810000000000000000",
      "collectedFees": "1465044890886432270",
      "commission": "732522445443216134",
      "commissionReserveAddress": "0x44aef3101432a64D1aA16388f4B9B352b09F42A9;0x13032DeB2d37556cf49301f713E9d7e1d1A8b169",
      "commissionReceiveAddress": "0xb9E29984Fe50602E7A619662EBED4F90D93824C7",
      "burnFees": "732522445443216136",
      "burnReserveAddress": "0x44aef3101432a64D1aA16388f4B9B352b09F42A9;0x13032DeB2d37556cf49301f713E9d7e1d1A8b169",
      "minuteSeq": 25800926,
      "hourSeq": 430015,
      "daySeq": 17917,
      "month": 201901,
      "year": 2019,
      "volumeEth": 0.3187989387,
      "volumeUsd": 37.4932650637
    },
    {
      "id": 141860,
      "blockNumber": 7102636,
      "blockHash": "0x8f055e77819942ee66e51040f51b9b6fe4e50c4b80d4fab68849bccf101ac085",
      "blockTimestamp": 1548055204,
      "tx": "0x35dfe40da0c1c519175667d1339faa32c6989a11bd218d63845d862ad56c144d",
      "uniqueTag": "0x35dfe40da0c1c519175667d1339faa32c6989a11bd218d63845d862ad56c144d_log_9cbf35c7",
      "sourceOfficial": 1,
      "destOfficial": 1,
      "sourceReserve": "0x0000000000000000000000000000000000000000",
      "destReserve": "0x4d864b5b4f866f65f53cbaad32eb9574760865e6",
      "makerAddress": "0xEAd1703dd838C9ABe8C088BE414BaD12A0a682Cc",
      "makerTokenAddress": "0x00E150D741Eda1d49d341189CAE4c08a73a49C95",
      "makerTokenSymbol": "INF",
      "makerTokenAmount": "1157999979168103432487",
      "takerAddress": "0xEAd1703dd838C9ABe8C088BE414BaD12A0a682Cc",
      "takerTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      "takerTokenSymbol": "ETH",
      "takerTokenAmount": "11083914000000000000",
      "collectedFees": "25468139329445280735",
      "commission": "7640441798833584220",
      "commissionReserveAddress": "0x4D864B5b4F866f65F53cbAAd32Eb9574760865e6",
      "commissionReceiveAddress": "0xEA1a7dE54a427342c8820185867cF49fc2f95d43",
      "burnFees": "17827697530611696515",
      "burnReserveAddress": "0x4D864B5b4F866f65F53cbAAd32Eb9574760865e6",
      "minuteSeq": 25800920,
      "hourSeq": 430015,
      "daySeq": 17917,
      "month": 201901,
      "year": 2019,
      "volumeEth": 11.083914,
      "volumeUsd": 1303.5555489614
    }
    ...
  ],
  "pagination": {
  "page": 0,
  "limit": 20,
  "totalCount": 129233,
  "maxPage": 6462
}
```
   
#### '/api/trades/:tradeId'  
ex: /api/trades/142014

(GET) returns detail of trade with id (not txHash)

<!-- Input Request Parameters -->

<!-- |Name | Type | Required | Description | -->
<!-- | ----------| ---------|------|-----------------------------| -->
<!-- |offcial|BOOL|NO| true or false (default is true). If `false` will return all trades of all tokens (offical and unoffical trades), if `true` will return only offical| -->

Response:
```javascript
{
"meta": {
  "code": 0,
  "serverTime": 1548056304284,
  "masterdataVersion": 1
},
"data": {
  "id": 141869,
  "blockNumber": 7102683,
  "blockHash": "0x3166f30dc4e1d4dd72854f96b05386f5da22d7ec6dee96241344ed5b94d9e3e4",
  "blockTimestamp": 1548056075,
  "tx": "0x793a3b2b52f9f24e5d3f7ad225cac7eca7776e1bcdb0a03b60dfb0911c4d3281",
  "uniqueTag": "0x793a3b2b52f9f24e5d3f7ad225cac7eca7776e1bcdb0a03b60dfb0911c4d3281_log_fc9f362e",
  "sourceOfficial": 1,
  "destOfficial": 1,
  "sourceReserve": "0x0000000000000000000000000000000000000000",
  "destReserve": "0x21433dec9cb634a23c6a4bbcce08c83f5ac2ec18",
  "makerAddress": "0x85C5c26DC2aF5546341Fc1988B9d178148b4838B",
  "makerTokenAddress": "0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6",
  "makerTokenSymbol": "RCN",
  "makerTokenAmount": "16574045421116460685908",
  "takerAddress": "0x85C5c26DC2aF5546341Fc1988B9d178148b4838B",
  "takerTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "takerTokenSymbol": "ETH",
  "takerTokenAmount": "1999261366488356495",
  "collectedFees": "2205031920862726025",
  "commission": "661509576258817807",
  "commissionReserveAddress": "0x21433Dec9Cb634A23c6A4BbcCe08c83f5aC2EC18",
  "commissionReceiveAddress": "0xC9D81352fBdb0294b091e51d774A0652ef776D99",
  "burnFees": "1543522344603908218",
  "burnReserveAddress": "0x21433Dec9Cb634A23c6A4BbcCe08c83f5aC2EC18",
  "minuteSeq": 25800934,
  "hourSeq": 430015,
  "daySeq": 17917,
  "month": 201901,
  "year": 2019,
  "volumeEth": 1.9992613665,
  "volumeUsd": null
  }
}
```

#### '/api/tokens'
ex: /api/tokens?fromDate=1547977465&toDate=1548063865&official=false

(GET) returns list of supported tokens (use for table tokens bellow charts)

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|official|BOOL|NO| true or false (default is true). If `false` will return all trades of all tokens (offical and unoffical trades), if `true` will return only offical|
|fromDate|INT|NO| Limit start time of trades in ms. If `null` will return all trades from blockno 5060595|
|toDate|INT|NO| Limit end time of trades in ms. If `null` will return all trades to current block|

Response:
```javascript
{
"meta": {
  "code": 0,
  "serverTime": 1548056642429,
  "masterdataVersion": 1
},
"data": [
  {
    "symbol": "ETH",
    "name": "Ethereum",
    "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "official": true,
    "volumeToken": "711.1368",
    "volumeTokenNumber": 711.1368284022466,
    "volumeUSD": 86115.3550871056,
    "volumeETH": "711.1368",
    "volumeEthNumber": 711.1368284025,
    "isNewToken": false
  },
  {
    "symbol": "DAI",
    "name": "Dai Stablecoin",
    "address": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    "official": true,
    "volumeToken": "25,913.8550",
    "volumeTokenNumber": 25913.854962480094,
    "volumeUSD": 26483.7305888679,
    "volumeETH": "217.9905",
    "volumeEthNumber": 217.9904752411,
    "isNewToken": false
  },
  ...
]
}

```

#### '/tokens/top' 
ex: /api/tokens/top?fromDate=1545471865&toDate=1548063865&official=false

(GET) Parameters and returns same as /tokens, order by volumeETH, use for chart top tokens

#### '/api/stats24h'
ex: /api/stats24h?official=false

(GET) Returns 24h status of kyber: networkVolume, collectedFees, totalBurnedFee

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|offcial|BOOL|NO| true or false (default is true). If `false` will return all trades of all tokens (offical and unoffical trades), if `true` will return only offical|

Response:
```javascript
{
"meta": {
  "code": 0,
  "serverTime": 1548056826873,
  "masterdataVersion": 1
},
"data": {
  "networkVolume": "$108,344.99",
  "collectedFees": "430,814.13",
  "totalBurnedFee": "341,521.53"
}
}
```

#### '/api/volumes'      
ex: /api/volumes?period=D30&interval=D1&symbol=DAI&official=false

(GET) Returns volume of netowrk/token between timerange, or in period (ignore WETH)

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|symbol|STRING|NO| Symbol of currency. If `null` will return volume of all tokens with Kyber Network contract|
|interval|STRING|NO| `H1` or `M1` or `D1`. Default is value `H1`. Frequence of data.|
|period|STRING|NO| `H24`(24 hours) or `D7`(7 days) or `D30`(1 month) or `Y1`(1 year) or `ALL`(all time 100years) String time range. (default is `D7`)|
|fromDate|INT|NO| Limit start time of volume in ms. If `null` will return volume from blockno 5060595|
|toDate|INT|NO| Limit end time of volume in ms. If `null` will return volume to current block|
|offcial|BOOL|NO| true or false (default is true). If `false` will return volume of all tokens (offical and unoffical trades), if `true` will return only offical|

Response:
```javascript
{
"meta": {
  "code": 0,
  "serverTime": 1548056985801,
  "masterdataVersion": 1
},
"data": [
  {
    "daySeq": 17887,
    "sum": 264385.4513321003,
    "sumEth": 2451.3458817156,
    "count": 628
  },
  {
    "daySeq": 17888,
    "sum": 501427.1152415001,
    "sumEth": 4358.4991382521,
    "count": 1011
  },
...
]
}
```

#### '/api/fees/to_burn'   
ex: /api/fees/to_burn?period=D30&interval=D1&symbol&official=false

(GET) Returns burn fee will burn in futrure between timerange

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|symbol|STRING|NO| Symbol of currency. If `null` will return fee will burn of all tokens with Kyber Network contract|
|interval|STRING|NO| `H1` or `M1` or `D1`. Default is value `H1`. Frequence of data.|
|period|STRING|NO| `H24`(24 hours) or `D7`(7 days) or `D30`(1 month) or `Y1`(1 year) or `ALL`(all time 100years) String time range. (default is `D7`)|
|fromDate|INT|NO| Limit start time in ms. If `null` will return fee will burn from blockno 5060595|
|toDate|INT|NO| Limit end time in ms. If `null` will return fee will burn to current block|
|offcial|BOOL|NO| true or false (default is true). If `false` will return all fee will burn of all tokens (offical and unoffical trades), if `true` will return only offical|
Response:
```javascript
{
"meta": {
  "code": 0,
  "serverTime": 1548059393442,
  "masterdataVersion": 1
},
"data": [
  {
    "daySeq": 17887,
    "sum": 3138.419236162249,
    "count": 638
  },
  {
    "daySeq": 17888,
    "sum": 5048.5816848908025,
    "count": 1035
  },
  {
    "daySeq": 17889,
    "sum": 6001.66507755463,
    "count": 1033
  },
...]
}
```

#### '/api/fees/collected'
ex: /api/fees/collected?period=D30&interval=D1&symbol&official=false

(GET) Returns collected fee in timerange (fee which reserve will pay for protocol, use to burn and pay for commission collectedFee = feeToBurn + commission )

Parameters and return format are the same as '/fees/to_burn'

#### '/api/fees/burned'   
(GET) Returns fee burned

Parameters and return format are the same as '/fees/to_burn'

#### '/api/search' 
ex: /api/search?q=0xfD7aAd1d54aD58E8CB667434e88e8abdb1224F82&limit=20&page=0&official=false
(GET) Return tx details or address detail depent on search string

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|exportData|BOOL|NO| `true` or `false` (default is `false`). If `true` will returns all data, dont care about page and limit, use for export to csv|
|q|STRING|NO| search string, depent on it is tx or address, if tx hash will returns tx detail, if address will returns address trade history|
|page|INT|NO|Start from 0. Default is value `0`. The page index of the response data. Each page includes maximum 1000 records.|
|limit|INT|NO| Limit number of trades each page. (default is `20`)|
|fromDate|INT|NO| Limit start time in ms. If `null` will return data from blockno 5060595|
|toDate|INT|NO| Limit end time in ms. If `null` will return data to current block|
|offcial|BOOL|NO| true or false (default is true). If `false` will return all data of all tokens (offical and unoffical trades), if `true` will return only offical|
Response:
```javascript
// TX
{
"meta": {
  "code": 0,
  "serverTime": 1548060133731,
  "masterdataVersion": 1
},
"data": {
  "id": 221694,
  "blockNumber": 7494271,
  "blockHash": "0x7fdd96a38955b79da0911eeea5bca51b044fd78d6ee55d8491b23f3af8d82160",
  "blockTimestamp": 1554280142,
  "tx": "0xe20dcdb122a5031977688d4f1e3f34dc5210c36786c83ae16b4424aebf08e15b",
  "uniqueTag": "0xe20dcdb122a5031977688d4f1e3f34dc5210c36786c83ae16b4424aebf08e15b_log_c67a70d6",
  "sourceOfficial": 1,
  "destOfficial": 1,
  "sourceReserve": "0x5d154c145db2ca90b8ab5e8fe3e716afa4ab7ff0",
  "destReserve": "0x0000000000000000000000000000000000000000",
  "makerAddress": "0xcAF75128617443694250e831D2C59632630a35cF",
  "makerTokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "makerTokenDecimal": 18,
  "makerTokenSymbol": "ETH",
  "makerTokenAmount": "650552491204303410",
  "takerAddress": "0xcAF75128617443694250e831D2C59632630a35cF",
  "takerTokenAddress": "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
  "takerTokenDecimal": 18,
  "takerTokenSymbol": "MKR",
  "takerTokenAmount": "147212280000000000",
  "collectedFees": "845652745244200930",
  "commission": "422826372622100465",
  "commissionReserveAddress": "0x5D154c145Db2ca90B8aB5e8Fe3E716AfA4AB7Ff0",
  "commissionReceiveAddress": "0xb9E29984Fe50602E7A619662EBED4F90D93824C7",
  "burnFees": "422826372622100465",
  "burnReserveAddress": "0x5D154c145Db2ca90B8aB5e8Fe3E716AfA4AB7Ff0",
  "minuteSeq": 25904669,
  "hourSeq": 431744,
  "daySeq": 17989,
  "month": 201904,
  "year": 2019,
  "volumeEth": 0.6505524912,
  }
}

```

#### '/api/partner/:partnerId' 
ex: /api/partner/0x2d841E088087D3A447d198725291D485dFBa024D?limit=20&page=0&official=false

(GET) returns partner detail by id or name

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|exportData|BOOL|NO| `true` or `false` (default is `false`). If `true` will returns all data, dont care about page and limit, use for export to csv|
|partnerId|STRING|NO| name or address of partner|
|page|INT|NO|Start from 0. Default is value `0`. The page index of the response data. Each page includes maximum 1000 records.|
|limit|INT|NO| Limit number of trades each page. (default is `20`)|
|fromDate|INT|NO| Limit start time in ms. If `null` will return data from blockno 5060595|
|toDate|INT|NO| Limit end time in ms. If `null` will return data to current block|
|offcial|BOOL|NO| true or false (default is true). If `false` will return all data of all tokens (offical and unoffical trades), if `true` will return only offical|

Response:
```javascript
{
"meta": {
  "code": 0,
  "serverTime": 1548063629545,
  "masterdataVersion": 1
},
"data": [
  {
    "id": 213106,
    "blockNumber": 7472248,
    "blockHash": "0xde08f23c28e985bb1f20c4281789508e43a9f9570a4b5aec854117eacd3d32c0",
    "blockTimestamp": 1553983113,
    "tx": "0xc880434f20840793a0f4e0ddb9cb55735a86b4e1bd94b71d20314e2228be2be0",
    "uniqueTag": "0xc880434f20840793a0f4e0ddb9cb55735a86b4e1bd94b71d20314e2228be2be0_log_d6859621",
    "sourceOfficial": 1,
    "destOfficial": 1,
    "sourceReserve": "0x04a487afd662c4f9deacc07a7b10cfb686b682a4",
    "destReserve": "0x04a487afd662c4f9deacc07a7b10cfb686b682a4",
    "makerAddress": "0xf2fA954E033e92ba3c76fD4372d479C99f614Ae3",
    "makerTokenAddress": "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    "makerTokenDecimal": 18,
    "makerTokenSymbol": "MKR",
    "makerTokenAmount": "674819653461270249",
    "takerAddress": "0xf2fA954E033e92ba3c76fD4372d479C99f614Ae3",
    "takerTokenAddress": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    "takerTokenDecimal": 18,
    "takerTokenSymbol": "DAI",
    "takerTokenAmount": "500000000000000000000",
    "collectedFees": "8814295332282834792",
    "commission": "2644288599684850436",
    "commissionReserveAddress": "0x04A487aFd662c4F9DEAcC07A7B10cFb686B682A4",
    "commissionReceiveAddress": "0x2d841E088087D3A447d198725291D485dFBa024D",
    "burnFees": "6170006732597984356",
    "burnReserveAddress": "0x04A487aFd662c4F9DEAcC07A7B10cFb686B682A4",
    "minuteSeq": 25899718,
    "hourSeq": 431661,
    "daySeq": 17985,
    "month": 201903,
    "year": 2019,
    "volumeEth": 3.3903761437,
    "volumeUsd": 481.8683886232
  },
  ...
  {
    "id": 212495,
    "blockNumber": 7470027,
    "blockHash": "0xa9e92d962dd71afc81fa1b039f5ba5e3e0f1e16605a87c60e55e14bb38941124",
    "blockTimestamp": 1553953553,
    "tx": "0xb8d77c3f97e733fe91f3ec29531bf938ba070ae4a6aab839f08ffebdac5b6969",
    "uniqueTag": "0xb8d77c3f97e733fe91f3ec29531bf938ba070ae4a6aab839f08ffebdac5b6969_log_ed719445",
    "sourceOfficial": 1,
    "destOfficial": 1,
    "sourceReserve": "0x04a487afd662c4f9deacc07a7b10cfb686b682a4",
    "destReserve": "0x63825c174ab367968ec60f061753d3bbd36a0d8f",
    "makerAddress": "0xf2fA954E033e92ba3c76fD4372d479C99f614Ae3",
    "makerTokenAddress": "0xe41d2489571d322189246dafa5ebde1f4699f498",
    "makerTokenDecimal": 18,
    "makerTokenSymbol": "ZRX",
    "makerTokenAmount": "30963118354996976866",
    "takerAddress": "0xf2fA954E033e92ba3c76fD4372d479C99f614Ae3",
    "takerTokenAddress": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    "takerTokenDecimal": 18,
    "takerTokenSymbol": "DAI",
    "takerTokenAmount": "10000000000000000000",
    "collectedFees": "175809297232623472",
    "commission": "52742789169787040",
    "commissionReserveAddress": "0x04A487aFd662c4F9DEAcC07A7B10cFb686B682A4;0x63825c174ab367968EC60f061753D3bbD36A0D8F",
    "commissionReceiveAddress": "0x2d841E088087D3A447d198725291D485dFBa024D",
    "burnFees": "123066508062836432",
    "burnReserveAddress": "0x04A487aFd662c4F9DEAcC07A7B10cFb686B682A4;0x63825c174ab367968EC60f061753D3bbD36A0D8F",
    "minuteSeq": 25899225,
    "hourSeq": 431653,
    "daySeq": 17985,
    "month": 201903,
    "year": 2019,
    "volumeEth": 0.0676241974,
    "volumeUsd": 9.5983946137
  }
],
"pagination": {
  "page": 0,
  "limit": 20,
  "totalCount": 485,
  "volumeUsd": 183142.4057378367,
  "volumeEth": 956.5518912551,
  "commission": 636655593469134100000,
  "collectedFees": 2.1221853115637807e+21,
  "maxPage": 25
  }
}
```


#### '/api/currencies/convertiblePairs'
ex: /api/currencies/convertiblePairs

(GET) Returns pair of supported tokens with eth, contain current price

[no params]

Response:
```javascript
{
"ETH_KNC": {
  "symbol": "KNC",
  "name": "Kyber Network",
  "contractAddress": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
  "decimals": 18,
  "currentPrice": 0.001144689345999999,
  "lastPrice": 0.0011505474049363748,
  "lastTimestamp": 1548064039,
  "baseVolume": 28.5140461337,
  "quoteVolume": 24626.29232267999
},
"ETH_OMG": {
  "symbol": "OMG",
  "name": "OmiseGO",
  "contractAddress": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
  "decimals": 18,
  "currentPrice": 0.0105194607632,
  "lastPrice": 0.010698316390188407,
  "lastTimestamp": 1548064047,
  "baseVolume": 94.7970423727,
  "quoteVolume": 9069.891490013306
},
"ETH_SNT": {
  "symbol": "SNT",
  "name": "Status Network",
  "contractAddress": "0x744d70fdbe2ba4cf95131626614a1763df805b9e",
  "decimals": 18,
  "currentPrice": 0.000193402066439931,
  "lastPrice": 0.00019964312447872846,
  "lastTimestamp": 1548064097,
  "baseVolume": 8.7645440735,
  "quoteVolume": 44978.96517808437
},
...
"ETH_ELF": {
  "symbol": "ELF",
  "name": "AELF",
  "contractAddress": "0xbf2179859fc6d5bee9bf9158632dc51678a4100e",
  "decimals": 18,
  "currentPrice": 0.000915859976800015,
  "lastPrice": 0.0009268932924598691,
  "lastTimestamp": 1548064071,
  "baseVolume": 7.617111453,
  "quoteVolume": 8231.224094874151
}
}
```

#### '/api/tokens/pairs'

(GET) Parameters and returns same as above, but easier to remember & type

#### '/api/tokens/supported' 

(GET) Return list token supported in network

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|includeDelisted|BOLL|NO| default is `false`. if `true` will return include delisted tokens|

Response:
```javascript
[
  {
    "symbol": "ETH",
    "cmcName": "ETH",
    "name": "Ethereum",
    "decimals": 18,
    "contractAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  },
  {
    "symbol": "KNC",
    "cmcName": "KNC",
    "name": "Kyber Network",
    "decimals": 18,
    "contractAddress": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200"
  },
  ...
  {
    "symbol": "OMG",
    "cmcName": "OMG",
    "name": "OmiseGO",
    "decimals": 18,
    "contractAddress": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07"
  }
]
```

#### '/api/tokens/rates'  

(GET) returns rate info of all tokens for rate chart of kyber swap             

[no params] 

Response:
```javascript
{
"KNC": {
"r": 0.001183464546668824,
"p": [
  0.0011444406592971738,
  0.0011116128944174924,
  0.001078548664705812,
  0.0010812955128230311,
  0.001079217168051335,
  ...
  0.0011438947777883662,
  0.001145731565463962,
  0.0011620191458792542,
  0.0011494324078277105
  ]
},
...
"OMG": {
"r": 0.010915941814299336,
"p": [
  0.010318809247804747,
  0.010191825936463322,
  ...
  0.010586676025548022,
  0.010684353097926043,
  0.010738598995131616
  ]
}
}
```

#### '/api/tickers'    

(GET) returns data of all token pairs with eth, include current rate, last trade and volume                

[no params] 

Response:
```javascript
{
"ETH_WETH": {
  "timestamp": 1554280800040,
  "quote_address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "quote_symbol": "WETH",
  "base_address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "base_symbol": "ETH",
  "past_24h_high": 1,
  "past_24h_low": 1,
  "usd_24h_volume": 74913.5972684024,
  "eth_24h_volume": 465.3060683757,
  "token_24h_volume": 465.3060683746255,
  "current_bid": 1,
  "current_ask": 1,
  "last_traded": 1.0000000000105538
},
"ETH_KNC": {
  "timestamp": 1554280800040,
  "quote_address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
  "quote_symbol": "KNC",
  "base_address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "base_symbol": "ETH",
  "past_24h_high": 0.001989085688921776,
  "past_24h_low": 0.001707469,
  "usd_24h_volume": 47034.1785347702,
  "eth_24h_volume": 284.6600869033,
  "token_24h_volume": 158821.6656919096,
  "current_bid": 0.001974154,
  "current_ask": 0.001992905884529421,
  "last_traded": 0.001799573364997696
},
...
"ETH_DAI": {
  "timestamp": 1554280800040,
  "quote_address": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
  "quote_symbol": "DAI",
  "base_address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "base_symbol": "ETH",
  "past_24h_high": 0.006439079249513585,
  "past_24h_low": 0.005612397,
  "usd_24h_volume": 535513.0226572352,
  "eth_24h_volume": 3327.193671083,
  "token_24h_volume": 547936.7564484699,
  "current_bid": 0.006756442,
  "current_ask": 0.00679048487291466,
  "last_traded": 0.005948818765453114
},
```

#### '/api/change24h'  

(GET) return 24h change data of all token  

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|usd|BOLL|NO| default is `false`. if `true` will return data with currency unit is `usd`, default is `ETH`|
<!-- |offcial|BOOL|NO| true or false (default is true). If `false` will return all trades of all tokens (offical and unoffical trades), if `true` will return only offical token pair| -->

Response:
```javascript
{
"ETH_KNC": {
  "timestamp": 1548065183567,
  "token_name": "Kyber Network",
  "token_symbol": "KNC",
  "token_decimal": 18,
  "token_address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
  "rate_eth_now": 0.001144689345999999,
  "change_eth_24h": -2.7115507894449724
},
"ETH_OMG": {
  "timestamp": 1548065183567,
  "token_name": "OmiseGO",
  "token_symbol": "OMG",
  "token_decimal": 18,
  "token_address": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
  "rate_eth_now": 0.0105194607632,
  "change_eth_24h": -2.0145305819746198
},
...
"ETH_SNT": {
  "timestamp": 1548065183567,
  "token_name": "Status Network",
  "token_symbol": "SNT",
  "token_decimal": 18,
  "token_address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e",
  "rate_eth_now": 0.000193402066439931,
  "change_eth_24h": 0.2557073208762608
}
}
```

## chart

#### '/chart/history'
ex: /chart/history?symbol=KNC&resolution=30&rateType=buy&from=1544924753&to=1545122790

(GET) return chart data for swap

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|symbol|STRING|YES| Symbol of currency. Return all history of all tokens with Kyber Network contract|
|resolution|STRING|YES| resolution of chart data|
|from|INT|YES| Limit start time of trades in ms|
|to|INT|YES| Limit end time of trades in ms|
|rateType|STRING|YES| Type of rate. Must be `sell` or `buy` or `mid`|

Response:
```javascript
{
"t": [
  1544923800,
  1544925600,
  1544927400,
  ...
  1545116400,
  1545118200,
  1545120000,
  1545121800
],
"o": [
  0.001468428781204112,
  0.001466275659824047,
  0.001432664756446991,
  ...
  0.001406469760900141,
  0.001402524544179523,
  0.001402524544179523
],
"h": [
  0.001468428781204112,
  0.001466275659824047,
  0.001451378809869376,
  ...
  0.001408450704225352,
  0.001404494382022472,
  0.001404494382022472
],
"l": [
  0.001466275659824047,
  0.001447178002894356,
  0.001432664756446991,
  ...
  0.001400560224089636,
  0.001398601398601399,
  0.001400560224089636
],
"c": [
  0.001466275659824047,
  0.001447178002894356,
  0.001449275362318841,
  ...
  0.001400560224089636,
  0.001402524544179523,
  0.001404494382022472
],
"s": "ok"
}
```

##### '/chart/config'

(GET) returns supported config for chart

Response:
```javascript
{
"supported_resolutions": [
  "60",
  "120",
  "240",
  "360",
  "720",
  "D",
  "W",
  "M"
],
"supports_group_request": false,
"supports_marks": false,
"supports_search": true,
"supports_timescale_marks": false,
"supports_time": true,
"exchanges": [],
"symbolsTypes": []
}
```    

#### '/chart/symbols'   
ex: /chart/symbols?symbol=KNC

(GET) returns supported config for token

Input Request Parameters

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|symbol|STRING|YES| Symbol of currency|

Response:
```javascript
{
"name": "KNC",
"ticker": "KNC",
"description": "Kyber Network",
"type": "Ethereum Token",
"session": "24x7",
"listed_exchange": "Kyber Network",
"timezone": "Asia/Singapore",
"minmov": 1,
"pricescale": 1000000,
"minmove2": 0,
"fractional": false,
"has_intraday": true,
"supported_resolutions": [
"60",
"120",
"240",
"360",
"720",
"D",
"W",
"M"
],
"intraday_multipliers": [
"60",
"120",
"240",
"360",
"720"
],
"has_seconds": false,
"seconds_multipliers": [],
"has_daily": true,
"has_weekly_and_monthly": true,
"has_empty_bars": true,
"force_session_rebuild": false,
"has_no_volume": true,
"volume_precision": 3,
"data_status": "pulsed",
"expired": false,
"currency_code": "ETH"
}
```

#### '/chart/search'

ex: /chart/search?limit=2&query=ETH

(GET) return token chart name

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|query|STRING|NO| token symbol, if `null` return list all token name|
|limit|INT|NO| Limt number token in list|


Response:
```javascript
[
  {
    "symbol": "WETH",
    "full_name": "WETH",
    "description": "Wrapped Ether"
  },
  {
    "symbol": "KNC",
    "full_name": "KNC",
    "description": "Kyber Network"
  },
  {
    "symbol": "DAI",
    "full_name": "DAI",
    "description": "Dai Stablecoin"
  }
]
```


#### '/chart/time'

(GET) return time in ms

#### '/chart/klines 

(GET) return time in ms

|Name | Type | Required | Description |
| ----------| ---------|------|-----------------------------|
|symbol|STRING|YES| token symbol|
|interval|STRING|YES| Interval of data, must be `d` or `w` or `m` or `y`|  
|rateType|STRING|NO| Type of rate data, must be `sell` or `buy` or `mid`|  


Response:
```javascript
{
"t": [
1547989200,
1548005400,
1548019800,
1548036000,
1548054000
],
"c": [
0.001130624165,
0.001146714457389733,
0.001129542228,
0.001156590653,
0.001139577230476519
],
"s": "ok"
}
```

