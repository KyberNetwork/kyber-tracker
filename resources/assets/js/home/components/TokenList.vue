<template>
  <div class="col-sm-12">
    <data-table ref="datatable"
        :title="getListTitle()"
        :getData="getList">
      <template slot="header">
        <th>#</th>
        <th>{{ $t("common.name") }}</th>
        <th>{{ $t("common.symbol") }}</th>
        <th>{{ $t("common.volume_24h_usd") }}</th>
        <th>{{ $t("common.volume_24h_token") }}</th>
      </template>

      <template slot="body" scope="slot">
        <tr>
          <td>{{ (slot.index + 1) }}</td>
          <td>{{ slot.item.name }}</td>
          <td>{{ slot.item.symbol }}</td>
          <td>{{ '$' + slot.item.volumeUSD }}</td>
          <td>{{ slot.item.volumeToken + ' ' + slot.item.symbol }}</td>
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
      return this.$t("token_list.title");
    },
    getList () {
      return AppRequest.getTopTokens();
    },
  },

  watch: {

  },

  mounted() {
    this.refresh();
  }

}
</script>

<style scoped lang="css">
</style>
