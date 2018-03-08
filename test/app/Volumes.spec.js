const _         = require('lodash');
const assert    = require('assert');
const async     = require('async');
const moment    = require('moment');
const logger    = require('sota-core').getLogger('Trades.specs.js');

describe('Test get volumes', () => {

  it('Get volume of all coin interval=H1', (done) => {
    const params = {
      interval: 'H1',
      fromDate: moment('2018-03-06 00:00:00Z').unix(),
      toDate: moment('2018-03-08 00:00:00Z').unix(),
    }

    requestTest('/api/volumes', params, (err, ret) => {
      assert.equal(err, null);
      assert.equal(ret.data.length, 48);
      assert.equal(ret.data[0].hourSeq, moment('2018-03-06 00:00:00Z').unix()/3600);
      assert.equal(ret.data[47].hourSeq, moment('2018-03-08 00:00:00Z').unix()/3600 - 1);

      done();
    });
  });

  it('Get volume of all coin interval=D1', (done) => {
    const params = {
      interval: 'D1',
      fromDate: moment('2018-03-01 00:00:00Z').unix(),
      toDate: moment('2018-03-08 00:00:00Z').unix(),
    }

    requestTest('/api/volumes', params, (err, ret) => {
      assert.equal(err, null);
      assert.equal(ret.data.length, 7);
      assert.equal(ret.data[0].daySeq, moment('2018-03-01 00:00:00Z').unix()/86400);
      assert.equal(ret.data[6].daySeq, moment('2018-03-08 00:00:00Z').unix()/86400 - 1);

      done();
    });
  });

});
