const _         = require('lodash');
const coreConst = require('sota-core').load('common/Const');

const appConst = {
  DEFAULT_PAGINATION: {
    fields: [
      {
        name: 'id',
        defaultOrder: coreConst.PAGINATION.ORDER.DESC,
        canBeEqual: false,
      }
    ]
  },

  CHART_INTERVAL: {
    M1  : 60,
    M30 : 60 * 30,
    H1  : 60 * 60,
    D1  : 60 * 60 * 24,
    W1  : 60 * 60 * 24 * 7,
  },

  CHART_PERIOD: {
    H24 : 60 * 60 * 24,
    D7  : 60 * 60 * 24 * 7,
    D30 : 60 * 60 * 24 * 30,
    Y1  : 60 * 60 * 24 * 365,
    ALL : 60 * 60 * 24 * 365 * 10, // 10 years
  },
};

module.exports = _.assign(coreConst, appConst);
