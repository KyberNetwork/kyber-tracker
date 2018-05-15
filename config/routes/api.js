module.exports = {
  GET: {
    '/trades'                       : ['TradeController.getTradesList'],
    '/trades/:tradeId'              : ['TradeController.getTradeDetails'],
    '/tokens/top'                   : ['TradeController.getTopTokensList'],
    '/stats24h'                     : ['TradeController.getStats24h'],
    '/volumes'                      : ['TradeController.getVolumes'],
    '/fees/to_burn'                 : ['TradeController.getToBurnFees'],
    '/fees/collected'               : ['TradeController.getCollectedFees'],
    '/fees/burned'                  : ['TradeController.getBurnedFees'],
    '/search'                       : ['TradeController.search'],
    '/partner/:partnerId'           : ['TradeController.getPartnerDetail'],
    
    // legacy
    '/currencies/convertiblePairs'  : ['CurrenciesController.getConvertiblePairs'],
    // same as above, but easier to remember & type
    '/tokens/pairs'                 : ['CurrenciesController.getConvertiblePairs'],
    '/tokens/supported'             : ['CurrenciesController.getSupportedTokens'],
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
