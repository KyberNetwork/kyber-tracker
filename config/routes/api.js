module.exports = {
  GET: {
    '/trades'                       : ['TradeController.getTradesList'],
    '/trades/:tradeId'              : ['TradeController.getTradeDetails'],
    '/tokens/top'                   : ['TradeController.getTopTokensList'],
    '/stats24h'                     : ['TradeController.getStats24h'],
    '/volumes'                      : ['TradeController.getVolumes'],
    '/fees/to_burn'                 : ['TradeController.getToBurnFees'],
    '/fees/to_wallet'               : ['TradeController.getToWalletFees'],
    '/fees/burned'                  : ['TradeController.getBurnedFees'],
    '/search'                       : ['TradeController.search'],
    '/marker_address/count'         : ['TradeController.countMarkerAddress'],
    '/marker_address/sum'           : ['TradeController.sumMarkerAddress'],

    '/currencies/convertiblePairs'  : ['CurrenciesController.getConvertiblePairs'],
    // '/currencies/:token'             : ['CurrenciesController.getCurrencyInfo'],
  },
  POST: {
    // Implement me.
  },
  PUT: {
    // Implement me.
  },
  DELETE: {
    // Implement me.
  }
};
