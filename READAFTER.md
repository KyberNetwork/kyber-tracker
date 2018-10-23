Kyber Tracker contains 5 proccesses, defined in app.json
- web: web view for tracker, run at https://tracker.kyber.network/, script server.js create new nodejs server serve resfull api

- burn: script burn.js run creates BurnCrawler process ('./app/crawlers/BurnCrawler')
/**
 * Traversal through all blocks from the moment contract was deployed
 * Find and record all burned fees in local database
 * NOTE: this class is currently only use for collecting burned fees
 * Trade data are crawled by KyberTradeCrawler
 */


 - trade: script trade.js craete TradeCrawler process ('./app/crawlers/TradeCrawler')
 Traversal through all blocks, get transaction of kyber, get logs from tx,
 read log topic, filter swap toppic and get data save to database

case topicExchange
  makerAddress = log.address;
  takerAddress = decodeParameter log.topics[1];
  takerTokenAddress = decodeParameter log.data 0->32
  makerTokenAddress = decodeParameter log.data 32->64;
  takerTokenAmount = decodeParameter log.data 64->96;
  makerTokenAmount = decodeParameter log.data 96->128;

  || ** maker, reserve, dest
  || ** taker, user, source

case topicFeeToWallet
  commissionReserveAddress += ";" + decodeParameter log.data 0->32
  commissionReceiveAddress = decodeParameter log.data 32->64
  commission += decodeParameter log.data 64->96

case topicBurnFee
  burnReserveAddress += ";" + decodeParameter log.data 0->32
  burnFees += decodeParameter log.data 64->96

case topicEtherReceival
  volumeEth = decodeParameter log.data 0->32 toWei()

- rate: script rate.js create RateCrawler process ('./app/crawlers/RateCrawler')
 Traversal through all blocks, get transaction of kyber, get logs from tx,
 read log topic, filter set rate toppic and get data save to database
    data.blockNumber = blockNo;
    data.blockTimestamp = blockTimestamp;
    data.baseAddress = baseAddress;
    data.baseSymbol = baseSymbol;
    data.quoteAddress = supportedTokens[i].address;
    data.quoteSymbol = quoteSymbol;

    data.sellExpected = sellExpected;
    data.buyExpected = buyExpected;
    data.midExpected = this._midRate (data.sellExpected, data.buyExpected);

- schedule: run schedule.js, create service, fake request to cache data interval
  service cache in "./config/cache/lists"

***************************
API Support

------------/api
'/trades'  
    symbol: ['string'],
    page: ['required', 'natural'],
    limit: ['required', 'naturalNonZero'],
    fromDate: ['naturalNonZero'],
    toDate: ['naturalNonZero'],     
  -> get trade history of token/all
         
'/trades/:tradeId'  
    tradeId: ['required', 'naturalNonZero'],         
  -> get trade detail with id (not txHash) 

'/tokens'   
    fromDate: ['natural'],
    toDate: ['natural'],  
  -> get list support token (use for table tokens bellow charts)

'/tokens/top' 
    same as /tokens, use for chart top tokens

'/stats24h' 
    [no params]
  -> get 24h status of kyber: networkVolume, collectedFees, totalBurnedFee

'/volumes'      
    symbol: ['string'],
    period: ['string'],
    interval: ['string'],
    fromDate: ['natural'],
    toDate: ['natural']        
  -> get volume of an token between timerange, or in period (ignore WETH)      

'/fees/to_burn'   
    symbol: ['string'],
    interval: ['string'],
    period: ['string'],
    fromDate: ['natural'],
    toDate: ['natural']     
  -> get burn fee will burn in futrure between timerange, or in period

'/fees/collected'
    symbol: ['string'],
    interval: ['string'],
    period: ['string'],
    fromDate: ['natural'],
    toDate: ['natural']        
  -> get collected fee in timerange     
  fee which reserve will pay for protocol, use to burn and pay for commission
  collectedFee = feeToBurn + commission

'/fees/burned'    
    interval: ['string'],
    period: ['string'],
    fromDate: ['natural'],
    toDate: ['natural']  
  -> get fee burned

'/search' 
    exportData: ['string'],
    q: ['required', 'string'],
    page: ['natural'],
    limit: ['naturalNonZero'],
    fromDate: ['natural'],
    toDate: ['natural'],   
  -> search by txHash or address      

'/partner/:partnerId'         
    exportData: ['string'],
    partnerId: ['required', 'string'],
    page: ['natural'],
    limit: ['naturalNonZero'],
    fromDate: ['natural'],
    toDate: ['natural'],
  -> get partner detail by id or name

'/currencies/convertiblePairs'
    [no params]
  -> get pair of supported tokens with eth, contain current price

'/tokens/pairs'
  -> // same as above, but easier to remember & type

'/tokens/supported' 
    [no params]   
  -> get supported tokens       
'/tokens/rates'               
    [no params] 
  -> get rate info for rate chart of kyber swap

'/tickers'                    
    [no params] 
  -> get data of all token pairs with eth, include current rate, last trade and volume

// 24h change info kyber mobile
'/change24h'    


---------/chart
'/history'
->get chart data for swap
              

