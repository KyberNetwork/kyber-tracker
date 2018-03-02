module.exports = {
  GET: {
    '/trades'                       : ['TradeController.getList', 'paginate'],
    '/trades/:tradeId'              : ['TradeController.getTradeDetails'],
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
