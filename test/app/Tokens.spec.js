const _             = require('lodash');
const assert        = require('assert');
const async         = require('async');
const moment        = require('moment');
const networkConfig = require('../../config/network');
const logger        = require('sota-core').getLogger('Trades.specs.js');

describe('Test get tokens list', () => {

  it('Get top-volume tokens', (done) => {
    const params = {
      page: 0,
      limit : 7
    };

    requestTest('/api/tokens/top', params, (err, ret) => {
      if (err) {
        logger.error(err);
      }

      const tokens = ret.data;
      const tokenNum = _.keys(networkConfig.tokens).length - 1; // Exclude ETH

      assert.equal(err, null);
      assert.equal(tokens.length, tokenNum);

      done();
    });
  });

});
