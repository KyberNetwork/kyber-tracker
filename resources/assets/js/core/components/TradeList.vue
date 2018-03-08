<template>
  <div>
    <div class="panel panel-default">

      <div v-if="!!title" class="panel-heading">
        <h4> {{ title }} </h4>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ $t("trade_list.date") }}</th>
              <th>{{ $t("trade_list.description") }}</th>
              <th>{{ $t("trade_list.rate") }}</th>
              <th>{{ $t("trade_list.amount") }}</th>
              <th>{{ $t("trade_list.fee_to_wallet") }}</th>
              <th>{{ $t("trade_list.fee_to_burn") }}</th>
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <tr v-for="(row, index) in rows" :item="row" :index="index">
              <td><router-link :to="getTradeLink(row.id)">
                <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="24px" width="24px" viewBox="0 0 40 40" style="vertical-align: middle;">
                <g><path d="m8.9 23.8c-2.2 0-3.9-1.7-3.9-3.8 0-2 1.7-3.7 3.9-3.7s3.9 1.7 3.9 3.7c0 2.1-1.7 3.8-3.9 3.8z m11.1 0c-2.2 0-3.9-1.7-3.9-3.8 0-2 1.7-3.7 3.9-3.7s3.9 1.7 3.9 3.7c0 2.1-1.7 3.8-3.9 3.8z m11.1 0c-2.2 0-3.9-1.7-3.9-3.8 0-2 1.7-3.7 3.9-3.7s3.9 1.7 3.9 3.7c0 2.1-1.7 3.8-3.9 3.8z"></path></g>
                </svg>
              </router-link></td>
              <td>{{ getDateInfo(row) }}</td>
              <td>
                <span>{{ $t("trade_list.exchange") }}</span>
                <token-link :symbol="row.takerTokenSymbol"></token-link>
                <span> > </span>
                <token-link :symbol="row.makerTokenSymbol"></token-link>
              </td>
              <td>
                {{ getMakerTokenInfo(row) }}
              </td>
              <td>{{ getMakerTokenInfo(row) }}</td>
              <td>{{ formatTokenNumber('KNC', row.takerFee) }}</td>
              <td>{{ formatTokenNumber('KNC', row.burnFees) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../request/AppRequest';
import util from '../helper/util';
import network from '../../../../../config/network';

export default {
  props: {
    getTokenSymbol: {
      type: Function,
    },
    title: {
      type: String,
    },
    pageSize: {
      type: Number,
    },
  },
  data() {
    return {
      rows: [],
      currentPage: 0,
      maxPage: 0,
      tokens: _.keyBy(_.values(network.tokens), 'symbol')
    };
  },
  computed: {

  },
  methods: {
    fetch () {
      const params = this.getRequestParams();
      AppRequest
        .getTrades(this.currentPage, this.pageSize || 20, params)
        .then((data) => {
          this.rows = data;
        });
    },
    getRequestParams () {
      return {
        symbol: this.getTokenSymbol(),
      };
    },
    getDateInfo (trade) {
      return util.getDateInfo(trade.blockTimestamp * 1000);
    },
    getDescription (trade) {

    },
    getTakerTokenInfo (trade) {
      const amount = trade.takerTokenAmount;
      const symbol = trade.takerTokenSymbol;
      const tokenInfo = this.tokens[symbol];
      const formatedAmount = util.formatTokenAmount(amount, tokenInfo.decimal);
      return  `${formatedAmount} ${symbol}`;
    },
    getMakerTokenInfo (trade) {
      const amount = trade.makerTokenAmount;
      const symbol = trade.makerTokenSymbol;
      const tokenInfo = this.tokens[symbol];
      const formatedAmount = util.formatTokenAmount(amount, tokenInfo.decimal);
      return  `${formatedAmount} ${symbol}`;
    },
    formatTokenNumber (symbol, amount) {
      const tokenInfo = this.tokens[symbol];
      return util.formatTokenAmount(amount, tokenInfo.decimal);
    },
    getTradeLink (id) {
      return `/trades/${id}`;
    },
  },
  created () {
    // TODO
  }
};
</script>

<style scoped lang="css">
  .container {
    margin-top: 2em;
  }

  .panel {
    background: none !important;
  }

  .panel-heading {
    text-align: center !important;
    background-color: #f5f5f5 !important;
  }

  .action-block {
    display: inline-block;
  }

  .paginator {
    padding: 9px 14px;
    margin-bottom: 14px;
    background-color: #f7f7f9;
    border: 1px solid #e1e1e8;
    border-radius: 4px;
  }

  .indicator {
    cursor: pointer;
  }

  .indicator-prev {

  }

  .indicator-next {
    float: right;
  }

  .table-responsive {
    overflow-x: visible !important;
  }

  .clearfix {
    clear: both;
    overflow: auto;
  }
</style>
