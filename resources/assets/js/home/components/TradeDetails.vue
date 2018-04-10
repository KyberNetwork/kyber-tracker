<template>
  <div class="col-sm-12 trade-details-container">

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.transaction_hash") }}</b></label></b-col>
      <b-col sm="9"><a class="long-address" target="_blank" :href="getTxEtherscanLink(record.tx)">{{ record.tx }}</a></b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.date") }}</b></label></b-col>
      <b-col sm="9">{{ getDateInfo(record.blockTimestamp) }}</b-col>
    </b-row>

    <b-row class="mt-20">
      <b-col sm="3"><label><b>{{ $t("trade_detail.taker_address") }}</b></label></b-col>
      <b-col sm="9"><router-link class="long-address" :to="`/search?q=${record.takerAddress}`">{{ record.takerAddress }}</router-link></b-col>
    </b-row>

    <b-row class="mt-20">
      <b-col sm="3"><label><b>{{ $t("trade_detail.taker_token") }}</b></label></b-col>
      <b-col sm="9">
        <span>{{ getTokenAmount(record.takerTokenAmount, record.takerTokenSymbol) }}</span>
        <span>{{ record.takerTokenSymbol }}</span>
        <span v-if="record.takerTotalUsd">(${{ formatFiatCurrency(record.takerTotalUsd) }})</span>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.maker_token") }}</b></label></b-col>
      <b-col sm="9">
        <span>{{ getTokenAmount(record.makerTokenAmount, record.makerTokenSymbol) }}</span>
        <span>{{ record.makerTokenSymbol }}</span>
        <span v-if="record.makerTotalUsd">(${{ formatFiatCurrency(record.makerTotalUsd) }})</span>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.rate") }}</b></label></b-col>
      <b-col sm="9">
        <span>1</span>
        <span><token-link class="token-link" :symbol="record.takerTokenSymbol"></token-link></span>
        <span> {{ $t("trade_detail.for") }} </span>
        <span>{{ getRate(record) }}</span>
        <span><token-link class="token-link" :symbol="record.makerTokenSymbol"></token-link></span>
      </b-col>
    </b-row>

    <b-row class="mt-20">
      <b-col sm="3"><label><b>{{ $t("trade_detail.fee_to_wallet") }}</b></label></b-col>
      <b-col sm="9">{{ getTokenAmount(record.commission, 'KNC') }} KNC</b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.collected_fees") }}</b></label></b-col>
      <b-col sm="9">{{ getTokenAmount(record.collectedFees, 'KNC') }} KNC</b-col>
    </b-row>

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

export default {

  data() {
    return {
      record: {
        "blockNumber": "",
        "blockHash": "",
        "blockTimestamp": "",
        "tx": "",
        "makerAddress": "",
        "makerTokenAddress": "",
        "makerTokenSymbol": "",
        "makerTokenAmount": "",
        "takerAddress": "",
        "takerTokenAddress": "",
        "takerTokenSymbol": "",
        "takerTokenAmount": "",
        "takerTotalUsd": "",
        "gasLimit": "",
        "gasPrice": "",
        "gasUsed": "",
        "collectedFees": "0",
        "commission": "0",
        "burnFees": "",
      },
      tokens: _.keyBy(_.values(network.tokens), 'symbol')
    };
  },

  methods: {
    refresh () {
      const id = this.$route.params.id;
      if (!id) {
        return;
      }
      AppRequest.getTradeDetails(id)
        .then((data) => {
          this.record = data;
        });
    },
    getDateInfo (timestamp) {
      const locale = localStorage.getItem('locale') || 'en';
      if (locale === 'vi') {
        return moment(timestamp * 1000).format('dddd, ngày Do/MM/YYYY, HH:mm:ss UTCZ');
      } else {
        return moment(timestamp * 1000).format('dddd, MMMM Do YYYY, HH:mm:ss UTCZ');
      }

    },
    getTokenAmount (amount, symbol) {
      if (!amount || !symbol) {
        return null;
      }

      const tokenInfo = util.getTokenInfo(symbol);
      return util.formatTokenAmount(amount, tokenInfo.decimal, 6);
    },
    getTxEtherscanLink (tx) {
      return network.endpoints.ethScan + 'tx/' + tx;
    },
    getAddressEtherscanLink (addr) {
      return network.endpoints.ethScan + 'address/' + addr;
    },
    doSearch (q) {
      this.$router.push({
        name: 'search',
        query: { q }
      });
    },
    getRate (trade) {
      if (!this.record.makerTokenSymbol || !this.record.takerTokenSymbol) {
        return '';
      }

      const makerToken = this.tokens[this.record.makerTokenSymbol];
      const takerToken = this.tokens[this.record.takerTokenSymbol];

      const makerAmount = (new BigNumber(this.record.makerTokenAmount.toString())).div(Math.pow(10, makerToken.decimal));
      const takerAmount = (new BigNumber(this.record.takerTokenAmount.toString())).div(Math.pow(10, takerToken.decimal));
      return util.roundingNumber(makerAmount.div(takerAmount).toNumber());
    },
    formatFiatCurrency (amount) {
      return util.formatFiatCurrency(amount);
    }
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
