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
    params: {},
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

  // {
  //   when: "*/10 * * * *",
  //   run: 'TickersCacheRefresher',
  //   service: 'CurrenciesService',
  //   functionName: 'getPair24hData',
  //   cache: {
  //     name: CacheInfo.ConvertiblePairs.key,
  //     time_exprire: CacheInfo.ConvertiblePairs.TTLTool
  //   },
  //   params: {
  //   },
  //   setCache: true
  // }
  ];

