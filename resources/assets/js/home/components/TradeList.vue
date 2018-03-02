<template>
  <div class="col-sm-12">
    <canvas id="myChart" width="100" height="25"></canvas>
    <data-table ref="datatable"
        :title="getListTitle()"
        :pageSize="pageSize"
        :getData="getList"
        :getPrevious="getPrevious"
        :getNext="getNext">
      <template slot="header">
        <th>ID</th>
        <th>{{ $t("trade_list.date") }}</th>
        <th>{{ $t("trade_list.taker_token") }}</th>
        <th>{{ $t("trade_list.maker_token") }}</th>
      </template>

      <template slot="body" scope="slot">
        <tr>
          <td><router-link :to="getTradeLink(slot.item.id)">
            <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="24px" width="24px" viewBox="0 0 40 40" style="vertical-align: middle;">
            <g><path d="m8.9 23.8c-2.2 0-3.9-1.7-3.9-3.8 0-2 1.7-3.7 3.9-3.7s3.9 1.7 3.9 3.7c0 2.1-1.7 3.8-3.9 3.8z m11.1 0c-2.2 0-3.9-1.7-3.9-3.8 0-2 1.7-3.7 3.9-3.7s3.9 1.7 3.9 3.7c0 2.1-1.7 3.8-3.9 3.8z m11.1 0c-2.2 0-3.9-1.7-3.9-3.8 0-2 1.7-3.7 3.9-3.7s3.9 1.7 3.9 3.7c0 2.1-1.7 3.8-3.9 3.8z"></path></g>
            </svg>
          </router-link></td>
          <td>{{ getDateInfo(slot.item) }}</td>
          <td>{{ getTakerTokenInfo(slot.item) }}</td>
          <td>{{ getMakerTokenInfo(slot.item) }}</td>
        </tr>
      </template>
    </data-table>

  </div>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../../core/request/AppRequest';
import util from '../../core/helper/util';
import network from '../../../../../config/network';
import Chart from 'chart.js';

export default {

  data() {
    return {
      pageSize: 10,
      tokens: _.keyBy(_.values(network.tokens), 'symbol')
    };
  },

  methods: {
    refresh () {
      if (!this.$refs.datatable) {
        window.clearInterval(this._refreshInterval);
        return;
      }

      this.$refs.datatable.fetch();
    },
    getListTitle () {
      return this.$t("trade_list.title");
    },
    getList () {
      return AppRequest.getTrades();
    },
    getNext () {
      return AppRequest.getTrades();
    },
    getPrevious () {
      return AppRequest.getTrades();
    },
    getDateInfo (trade) {
      return util.getDateInfo(trade.blockTimestamp * 1000);
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
    getTradeLink (id) {
      return `/trade?id=${id}`;
    }
  },

  watch: {

  },

  mounted() {
    this._refreshInterval = window.setInterval(() => {
      this.refresh();
    }, 10000);

    this.refresh();

    // TODO: correct data to be filled here.
    const ctx = document.getElementById('myChart');
    const data = {
      labels: ["Feb 23", "Feb 24", "Feb 25", "Feb 26", "Feb 27", "Feb 28", "Mar 01"],
      datasets: [{
        label: 'Network volume',
        data: [0, 59, 75, 20, 20, 55, 40],
      }]
    };
    const options = {};
    const myChart = new Chart(ctx, {
      type: 'line',
      data,
      options
    });
  }

}
</script>

<style scoped lang="css">
</style>
