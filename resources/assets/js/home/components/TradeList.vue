<template>
  <div class="col-sm-12">
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
      return null;
    },
  },

  mounted() {
    this._refreshInterval = window.setInterval(() => {
      this.refresh();
    }, 10000);

    this.refresh();
  },

}
</script>
