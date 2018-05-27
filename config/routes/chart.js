module.exports = {
    GET: {
      '/config' : ['ChartController.config'],
      '/symbols' : ['ChartController.symbols'],
      '/search' : ['ChartController.search'],
      '/:rateType/history' : ['ChartController.history'],
      '/time' : ['ChartController.time'],
    },
    POST: {
    },
    PUT: {
    },
    DELETE: {
    }
  };
  