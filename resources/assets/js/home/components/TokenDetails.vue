<template>
  <div class="col-sm-12">
    <canvas id="myChart" width="100" height="25"></canvas>
    <trade-list ref="datatable"
      :getTokenSymbol="getTokenSymbol">
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
      tokens: _.keyBy(_.values(network.tokens), 'address')
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
    getTokenSymbol () {
      const tokenAddr = this.$route.params.tokenAddr;
      const tokenDef = this.tokens[tokenAddr];
      return tokenDef ? tokenDef.symbol : null;
    },
  },

  watch: {
    '$route.query' () {
      this.refresh();
    }
  },

  mounted() {
    if (!this.getTokenSymbol()) {
      return;
    }

    this.refresh();

    // TODO: correct data to be filled here.
    const ctx = document.getElementById('myChart');
    const data = {
      labels: ["Feb 23", "Feb 24", "Feb 25", "Feb 26", "Feb 27", "Feb 28", "Mar 01"],
      datasets: [{
        label: 'Token volume',
        data: [11, 44, 76, 22, 27, 55, 42],
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
