const Const = require('../../app/common/Const');
const WEEK_IN_MILISECONDS = Const.MINUTE_IN_MILLISECONDS * 60 * 24 * 7
const HOUR_IN_MILISECONDS = Const.MINUTE_IN_MILLISECONDS * 60
module.exports = {
  "CurrenciesAllRates": {
    key: "all-rates",
    TTL: {ttl: 60 * Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS}
  },
  "CmcCurrentPrice": {
    key: "cmc-current-price-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CmcCurrentRate": {
    key: "cmc-current-rate-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CmcAllRates": {
    key: "cmc-all-rates",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CMCTokenInfo": {
    key: "cmc-token-info-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CGTokenMaketData": {
    key: "coingecko-token-market-data-",
    TTL: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS}
  },
  "CoingeckoETHPrice": {
    key: "coingecko-ETH-price",
    TTL: {ttl: WEEK_IN_MILISECONDS}
  },
  "chart_history_1h": {
    key: "chart_history_1h_",
    TTL: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 15 * Const.MINUTE_IN_MILLISECONDS}
  },
  "TradesList": {
    key: "trades-list-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "ReserveTradesList": {
    key: "reserve-trades-list-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "CollectedFeeList": {
    key: "collected-fee-list-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "BurnedList": {
    key: "burned-list-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "TopTokensList": {
    key: "top-token-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },

  "ReservesList": {
    key: "reserves-list-",
    TTL: {ttl: 15 * Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 15 * Const.MINUTE_IN_MILLISECONDS}
  },
  "ReserveDetail": {
    key: "reserve-detail-",
    TTL: {ttl: 5 * Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },

  "TokensList": {
    key: "token-list-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "PartnerList": {
    key: "partners-list-",
    TTL: {ttl: 5 * Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "NetworkVolumes": {
    key: "vol-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS},
    LongTTLTool: {ttl: 5 * HOUR_IN_MILISECONDS}
  },
  "UniqueTrader": {
    key: "unique-trader-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS},
    LongTTLTool: {ttl: 5 * HOUR_IN_MILISECONDS}
  },
  "NumberTrades": {
    key: "number-trades-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS},
    LongTTLTool: {ttl: 5 * HOUR_IN_MILISECONDS}
  },
  "PairsVolumes": {
    key: "pairs-vol-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "BurnedFees": {
    key: "burned-fee-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CollectedFees": {
    key: "collected-fee-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS}
  }
  ,
  "ToBurnFees": {
    key: "to-burn-fee-",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "Stats24h": {
    key: "stats24h",
    TTL: {ttl: Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 0.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "Change24h": {
    key: "24h-change-",
    TTL: {ttl: 5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "ConvertiblePairs": {
    key: "convertible-pairs",
    TTL: {ttl: 15 * Const.MINUTE_IN_MILLISECONDS},
    TTLTool: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS}
  },
  "Pair24hData": {
    key: "pairs-24h-data",
    TTL: {ttl: HOUR_IN_MILISECONDS},
    TTLTool: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS}
  },
  "TotalBurnedFees": {
    key: "burned-fee-total",
    TTL: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS}
  },
  "klines": {
    key: "klines",
    TTL: {ttl: 5 * Const.MINUTE_IN_MILLISECONDS}
  }
};
