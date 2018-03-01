module.exports = {
  GET: {
    '/trades'                        : ['TradeController.getList', 'paginate'],
    '/trades/:tradeId'               : ['TradeController.getTradeDetails'],
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
