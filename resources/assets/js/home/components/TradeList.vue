<template>
  <div class="col-sm-12">
    <div class="panel-heading pb-16">
        <span class=" panel-title no-margin">{{$t('navigator.trade_history')}} </span>
      </div>
    <trade-list ref="datatable"
      :title="getListTitle()"
      :getFilterTokenAddress="getFilterTokenAddress"
      :x="true"
      :isShowTotal="true"
      >
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
// import network from '../../../../../config/network';
import Chart from 'chart.js';

console.log("+++++++++++++++", window["GLOBAL_STATE"])
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens
export default {

  data() {
    return {
      pageSize: 10,
      tokens: _.keyBy(_.values(TOKENS_BY_ADDR), 'symbol'),
      query: this.$route.query,
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
      return '';
    },
    getFilterTokenAddress () {
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
