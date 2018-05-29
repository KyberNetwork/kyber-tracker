/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _ = require('lodash');
const async = require('async');
const util = require('util');
const BigNumber = require('bignumber.js');
const network = require('../../config/network');
const Const = require('../common/Const');
const helper = require('../common/Utils');
const Utils = require('sota-core').load('util/Utils');
const BaseService = require('sota-core').load('service/BaseService');
const LocalCache = require('sota-core').load('cache/foundation/LocalCache');
const logger = require('sota-core').getLogger('CurrenciesService');

const tokens = network.tokens;

module.exports = BaseService.extends({
    classname: 'ChartService',

    // options: symbol, rateType, seqType, from, to
    history: function (options, callback) {

        const col = options.rateType + "_expected";
        const seqCol = options.seqType || "hour_req";

        const rawQuery = `select
            ${seqCol} as seq,
            MAX(${col}) as high,
            MIN(${col}) as low,
            SUBSTRING_INDEX(GROUP_CONCAT(CAST(${col} AS CHAR) ORDER BY block_number ASC SEPARATOR ';'), ';', 1 ) as open,
            SUBSTRING_INDEX(GROUP_CONCAT(CAST(${col} AS CHAR) ORDER BY block_number DESC SEPARATOR ';'), ';', 1 ) as close
            from rate
            where ${col} > 0 AND quote_symbol = ?
            AND block_timestamp >= ? AND block_timestamp <= ?
            group by ${seqCol}`;

        const params = [options.symbol, options.from, options.to];

        // From any model, get adapter to connect database
        // Use master adapter for writing data, and slave for reading
        const adapter = this.getModel('RateModel').getSlaveAdapter();

        // Execute the raw query
        adapter.execRaw(rawQuery, params, callback);

    },

});