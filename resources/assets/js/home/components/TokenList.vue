<template>
  <div class="col-sm-12">
    <data-table ref="datatable"
        :title="getListTitle()"
        :getData="getList">
      <template slot="header">
        <th>No.</th>
        <th>{{ $t("common.name") }}</th>
        <th>{{ $t("common.symbol") }}</th>
        <th class="text-right">{{ $t("common.volume_24h_usd") }}</th>
        <th class="text-right">{{ $t("common.volume_24h_token") }}</th>
      </template>

      <template slot="body" scope="slot">
        <tr>
          <td>{{ (slot.index + 1) }}</td>
          <td><img class="image-inline-td mr-1" :src="getTokenImageLink(slot.item.symbol)" /> {{ slot.item.name }}</td>
          <td><token-link :symbol="slot.item.symbol"></token-link></td>
          <td class="text-right">{{ formatVolumeUSD(slot.item) }}</td>
          <td class="text-right">{{ slot.item.volumeToken }}<span class="td-inline-symbol">{{ slot.item.symbol }}</span></td>
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
      this.$refs.datatable.fetch();
    },
    getListTitle () {
      return '';
    },
    getList () {
      const now = Date.now() / 1000 | 0;
      return AppRequest.getTopTokens({
        fromDate: now - 24 * 60 * 60,
        toDate: now
      });
    },
    formatVolumeUSD (item) {
      return '$' + (new BigNumber(item.volumeUSD.toString())).toFormat(2);
    },
    getTokenImageLink (symbol) {
      return 'images/tokens/' + this.tokens[symbol].icon;
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
