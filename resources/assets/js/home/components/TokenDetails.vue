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

  },

  mounted() {
    if (!this.getTokenSymbol()) {
      return;
    }

    this.refresh();
  }

}
</script>

<style scoped lang="css">
</style>
