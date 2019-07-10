module.exports = {
    GET: {
      '/config' : ['ChartController.config'],
      '/symbols' : ['ChartController.symbols'],
      '/search' : ['ChartController.search'],
      '/history' : ['ChartController.historyCache'],
      '/time' : ['ChartController.time'],
      '/klines' : ['ChartController.klines'],
    },
    POST: {
    },
    PUT: {
    },
    DELETE: {
    }
  };
