<template>
  <div class="col-sm-12">
    <canvas id="myChart" width="100" height="25"></canvas>
    <trade-list ref="datatable"
      :title="getListTitle()"
      :getFilterTokenSymbol="getFilterTokenSymbol">
    </trade-list>

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
    getFilterTokenSymbol () {
      const tokenAddr = this.$route.params.tokenAddr;
      const tokenDef = this.tokens[tokenAddr];
      return tokenDef ? tokenDef.symbol : null;
    },
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
