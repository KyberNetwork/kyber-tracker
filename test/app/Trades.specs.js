const _         = require('lodash');
const assert    = require('assert');
const async     = require('async');
const moment    = require('moment');
const logger    = require('sota-core').getLogger('Trades.specs.js');

describe('Test get trades list', () => {

  it('Get trades list of all tokens normally', (done) => {
    const params = {
      page: 0,
      limit : 7
    };

    requestTest('/api/trades', params, (err, ret) => {
      if (err) {
        logger.error(err);
      }

      const trades = ret.data;

      assert.equal(err, null);
      assert.equal(trades.length, 7);

      done();
    });
  });

  it('Get trades list of all tokens in a time frame', (done) => {
    const params = {
      page: 0,
      limit: 10,
      fromDate: moment('2018-02-14 00:00:00Z').unix(),
      toDate: moment('2018-02-15 00:00:00Z').unix(),
    }

    requestTest('/api/trades', params, (err, ret) => {
      const trades = ret.data;
      const pagination = ret.pagination;

      assert.equal(err, null);
      assert.equal(trades.length, 10);
      assert.equal(pagination.totalCount, 33);

      done();
    });
  });

  it('Get trades list of 1 token (OMG) in a time frame', (done) => {
    const params = {
      page: 0,
      limit: 10,
      symbol: 'OMG',
      fromDate: moment('2018-02-14 00:00:00Z').unix(),
      toDate: moment('2018-02-15 00:00:00Z').unix(),
    }

    requestTest('/api/trades', params, (err, ret) => {
      const trades = ret.data;
      const pagination = ret.pagination;

      assert.equal(err, null);
      assert.equal(trades.length, 4);
      assert.equal(pagination.totalCount, 4);

      assert(_.every(trades, (trade) => trade.takerTokenSymbol === 'OMG' || trade.makerTokenSymbol === 'OMG'));

      done();
    });
  });

});
