module.exports = {
  GET: {
    '/trades'                       : ['TradeController.getTradesList', 'paginate'],
    '/trades/:tradeId'              : ['TradeController.getTradeDetails'],
    '/tokens/top'                   : ['TradeController.getTopTokensList'],
    '/stats24h'                     : ['TradeController.getStats24h'],
    '/volumes'                      : ['TradeController.getVolumes'],
    '/fees'                         : ['TradeController.getFees'],
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
