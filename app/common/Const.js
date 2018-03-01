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
};

module.exports = _.assign(coreConst, appConst);
