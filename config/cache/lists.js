const CacheInfo = require('../../config/cache/info');

module.exports = [
  {
    when: "*/10 * * * *",
    run: 'AllRateInfoCacheRefresher',
    service: 'CurrenciesService',
    functionName: 'getAllRateInfo',
    // cache: {
    //   name: CacheInfo.CurrenciesAllRates.key,
    //   time_exprire: CacheInfo.CurrenciesAllRates.TTLTool
    // },
    params: {
      official: true
    },
    setCache: false
  },
  {
    when: "*/1 * * * *",
    run: 'VolumesCacheRefresher',
    service: 'TradeService',
    functionName: '_getNetworkVolumes',
    cache: {
      name: CacheInfo.NetworkVolumes.key,
      time_exprire: CacheInfo.NetworkVolumes.TTLTool
    },
    params: {
      symbol: '',
      period: 'D30',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    },
    setCache: true
  },

  {
    // cache volume 1Y
    when: "*/30 * * * *",
    run: 'VolumesCacheRefresher',
    service: 'TradeService',
    functionName: '_getNetworkVolumes',
    cache: {
      name: CacheInfo.NetworkVolumes.key,
      time_exprire: CacheInfo.NetworkVolumes.LongTTLTool
    },
    params: {
      symbol: '',
      period: 'Y1',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    },
    setCache: true
  },
  {
    // cache volume ALL
    when: "*/35 * * * *",
    run: 'VolumesCacheRefresher',
    service: 'TradeService',
    functionName: '_getNetworkVolumes',
    cache: {
      name: CacheInfo.NetworkVolumes.key,
      time_exprire: CacheInfo.NetworkVolumes.LongTTLTool
    },
    params: {
      symbol: '',
      period: 'ALL',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    },
    setCache: true
  },

  {
    // cache unique address 1Y
    when: "*/40 * * * *",
    run: 'UniqueAddressCacheRefresher',
    service: 'TradeService',
    functionName: '_getUniqueNumberTraders',
    cache: {
      name: CacheInfo.UniqueTrader.key,
      time_exprire: CacheInfo.UniqueTrader.LongTTLTool
    },
    params: {
      symbol: '',
      period: 'Y1',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    },
    setCache: true
  },
  {
    // cache unique address ALL
    when: "*/45 * * * *",
    run: 'UniqueAddressCacheRefresher',
    service: 'TradeService',
    functionName: '_getUniqueNumberTraders',
    cache: {
      name: CacheInfo.UniqueTrader.key,
      time_exprire: CacheInfo.UniqueTrader.LongTTLTool
    },
    params: {
      symbol: '',
      period: 'ALL',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    },
    setCache: true
  },

  {
    // cache total trades 1Y
    when: "*/50 * * * *",
    run: 'TotalTradesCacheRefresher',
    service: 'TradeService',
    functionName: '_getTotalNumberTrades',
    cache: {
      name: CacheInfo.NumberTrades.key,
      time_exprire: CacheInfo.NumberTrades.LongTTLTool
    },
    params: {
      symbol: '',
      period: 'Y1',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    },
    setCache: true
  },
  {
    // cache total trades ALL
    when: "*/55 * * * *",
    run: 'TotalTradesCacheRefresher',
    service: 'TradeService',
    functionName: '_getTotalNumberTrades',
    cache: {
      name: CacheInfo.NumberTrades.key,
      time_exprire: CacheInfo.NumberTrades.LongTTLTool
    },
    params: {
      symbol: '',
      period: 'ALL',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    },
    setCache: true
  },



  {
    when: "*/1 * * * *",
    run: 'TradesListCacheRefresher',
    service: 'TradeService',
    functionName: 'getTradesList',
    cache: {
      name: CacheInfo.TradesList.key,
      time_exprire: CacheInfo.TradesList.TTLTool
    },
    params: {
      symbol: '',
      page: 0,
      limit: 5,
      fromDate: '',
      toDate: '',
    },
    setCache: true
  },
  {
    when: "*/1 * * * *",
    run: 'TopTokenCacheRefresher',
    service: 'TradeService',
    functionName: 'getTopTokensList',
    cache: {
      name: CacheInfo.TopTokensList.key,
      time_exprire: CacheInfo.TopTokensList.TTLTool
    },
    params: {},
    setCache: true
  },
  {
    when: "*/1 * * * *",
    run: 'Stats24hCacheRefresher',
    service: 'TradeService',
    functionName: '_getStats24h',
    cache: {
      name: CacheInfo.Stats24h.key,
      time_exprire: CacheInfo.Stats24h.TTLTool
    },
    params: {},
    setCache: true
  },
  {
    when: "*/10 * * * *",
    run: 'HistoryCacheRefresher',
    service: 'ChartService',
    functionName: 'chart_history_all',
    cache: {
      name: CacheInfo.chart_history_1h.key,
      time_exprire: CacheInfo.chart_history_1h.TTLTool
    },
    params: {
      rateType: 'sell',
      resolution: '60',
    },
    setCache: false
  },

  {
    when: "*/10 * * * *",
    run: 'TickersCacheRefresher',
    service: 'CurrenciesService',
    functionName: 'getPair24hData',
    // cache: {
      // name: CacheInfo.ConvertiblePairs.key,
      // time_exprire: CacheInfo.ConvertiblePairs.TTLTool
    // },
    params: {
      official: true
    },
    setCache: false
  },
  {
    when: "*/11 * * * *",
    run: 'ReserveListCacheRefresher',
    service: 'TradeService',
    functionName: 'getReservesList',
    cache: {
      name: CacheInfo.ReservesList.key,
      time_exprire: CacheInfo.ReservesList.TTLTool
    },
    params: {
    },
    setCache: true
  }
  ];

