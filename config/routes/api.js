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
