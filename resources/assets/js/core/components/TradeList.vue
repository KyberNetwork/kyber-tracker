<template>
  <div>
    <div class="panel panel-default">

      <div v-if="!!title" class="panel-heading">
        <h4> {{ title }} </h4>
      </div>

      <paginate
        :page-count="maxPage"
        :initial-page="currentPage"
        :page-range="3"
        :margin-pages="2"
        :click-handler="clickToPage"
        :container-class="'pagination'"
        :page-class="'page-item'">
      </paginate>
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
                <span>1</span>
                <span>{{ row.takerTokenSymbol }}</span>
                <span>=</span>
                <span>{{ getRate(row) }}</span>
                <span>{{ row.makerTokenSymbol }}</span>
              </td>
              <td>
                <span>{{ formatTokenNumber(row.takerTokenSymbol, row.takerTokenAmount) }}</span>
                <span>{{ row.takerTokenSymbol }}</span>
                <span>for</span>
                <span>{{ formatTokenNumber(row.makerTokenSymbol, row.makerTokenAmount) }}</span>
                <span>{{ row.makerTokenSymbol }}</span>
              </td>
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
        .getTrades(this.currentPage, this.pageSize || 20, params, (err, res) => {
          const data = res.data;
          const pagination = res.pagination;
          this.rows = data;
          this.maxPage = pagination.maxPage;
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
    getRate (trade) {
      const makerAmount = new BigNumber(trade.makerTokenAmount.toString());
      const takerAmount = new BigNumber(trade.takerTokenAmount.toString())
      return makerAmount.div(takerAmount).toFormat(5);
    },
    formatTokenNumber (symbol, amount) {
      const tokenInfo = this.tokens[symbol];
      return util.formatTokenAmount(amount, tokenInfo.decimal);
    },
    getTradeLink (id) {
      return `/trades/${id}`;
    },
    clickToPage (page) {
      this.currentPage = page - 1;
      this.fetch();
    }
  }
};
</script>

<style lang="css">
  .page-item {
    padding-right: 5px;
    padding-left: 5px;
  }
  .page-item.active {
    background-color: cyan;
  }
</style>
