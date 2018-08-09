module.exports = [
  {
    max: 10,
    apis: ['/api/currencies/convertiblePairs', '/api/tokens/pairs', '/api/tokens/supported', '/api/tokens/rates', '/api/tickers', '/api/change24h', '/chart/config', '/chart/symbols', '/chart/search', '/chart/history', '/chart/time'],
    rest: true
  },
  {
    max: 50,
    apis: ['/'],
    rest: false
  }
];
