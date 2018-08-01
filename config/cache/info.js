const Const = require('../../app/common/Const');

module.exports = {
  "CurrenciesAllRates": {
    key: "all-rates",
    timeMns: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS},
    timeMnsTool: {ttl: 15 * Const.MINUTE_IN_MILLISECONDS}
  },
  "CmcCurrentPrice": {
    key: "cmc-current-price-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CmcCurrentRate": {
    key: "cmc-current-rate-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CmcAllRates": {
    key: "cmc-all-rates",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CMCTokenInfo": {
    key: "cmc-token-info-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "chart_history_1h": {
    key: "chart_history_1h_",
    timeMns: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS},
    timeMnsTool: {ttl: 15 * Const.MINUTE_IN_MILLISECONDS}
  },
  "TradesList": {
    key: "trades-list-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS},
    timeMnsTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "TopTokensList": {
    key: "top-token-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS},
    timeMnsTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "NetworkVolumes": {
    key: "vol-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS},
    timeMnsTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "BurnedFees": {
    key: "burned-fee-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "CollectedFees": {
    key: "collected-fee-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  }
  ,
  "ToBurnFees": {
    key: "to-burn-fee-",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "Stats24h": {
    key: "stats24h",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS},
    timeMnsTool: {ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "Change24h": {
    key: "24h-change-",
    timeMns: {ttl: 5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "ConvertiblePairs": {
    key: "convertible-pairs",
    timeMns: {ttl: 5 * Const.MINUTE_IN_MILLISECONDS}
  },
  "Pair24hData": {
    key: "pair-24h",
    timeMns: {ttl: Const.MINUTE_IN_MILLISECONDS}
  },
  "TotalBurnedFees": {
    key: "burned-fee-total",
    timeMns: {ttl: 10 * Const.MINUTE_IN_MILLISECONDS}
  }
};
