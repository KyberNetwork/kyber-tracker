module.exports = {
  GET: {
    '/trades'                       : ['TradeController.getTradesList'],
    '/reserveTrades'                : ['TradeController.getReserveTradesList'],
    '/collectedFeeList'             : ['TradeController.getCollectedFeeList'],
    '/trades/:tradeId'              : ['TradeController.getTradeDetails'],
    '/tokens'                       : ['TradeController.getTokens'],
    '/tokens/top'                   : ['TradeController.getTopTokensList'],
    '/stats24h'                     : ['TradeController.getStats24h'],
    '/volumes'                      : ['TradeController.getVolumes'],
    '/volume_pairs'                 : ['TradeController.getVolumesPairToken'],
    '/fees/to_burn'                 : ['TradeController.getToBurnFees'],
    '/fees/collected'               : ['TradeController.getCollectedFees'],
    '/fees/burned'                  : ['TradeController.getBurnedFees'],
    '/fees/burned-list'             : ['TradeController.getBurnedList'],

    '/search'                       : ['TradeController.search'],
    '/partner/:partnerId'           : ['TradeController.getPartnerDetail'],


    '/reserves'                       : ['TradeController.getReservesList'],
    '/reserves/:reserveAddr'          : ['TradeController.getReserveDetails'],
    // legacy
    '/currencies/convertiblePairs'  : ['CurrenciesController.getConvertiblePairs'],
    // same as above, but easier to remember & type
    '/tokens/pairs'                 : ['CurrenciesController.getConvertiblePairs'],
    '/tokens/supported'             : ['CurrenciesController.getSupportedTokens'],
    '/tokens/rates'                 : ['CurrenciesController.getAllRateInfo'],

    '/tickers'                      : ['CurrenciesController.getPair24hData'],

    // 24h change info kyber mobile
    '/change24h'                    : ['CurrenciesController.get24hChangeData'],
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
