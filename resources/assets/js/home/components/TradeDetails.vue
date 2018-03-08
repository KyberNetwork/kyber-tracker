<template>
  <div class="col-sm-12">
    <h1>Trade Details</h1>
    <hr />

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.transaction_hash") }}</b></label></b-col>
      <b-col sm="9">{{ record.tx }}</b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.date") }}</b></label></b-col>
      <b-col sm="9">{{ getDateInfo(record.blockTimestamp) }}</b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.taker_address") }}</b></label></b-col>
      <b-col sm="9">{{ record.takerAddress }}</b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.taker_token") }}</b></label></b-col>
      <b-col sm="9">{{ record.takerTokenSymbol }}</b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.taker_amount") }}</b></label></b-col>
      <b-col sm="9">{{ getTokenAmount(record.takerTokenAmount, record.takerTokenSymbol) }}</b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.maker_token") }}</b></label></b-col>
      <b-col sm="9">{{ record.makerTokenSymbol }}</b-col>
    </b-row>

    <b-row>
      <b-col sm="3"><label><b>{{ $t("trade_detail.maker_amount") }}</b></label></b-col>
      <b-col sm="9">{{ getTokenAmount(record.makerTokenAmount, record.makerTokenSymbol) }}</b-col>
    </b-row>

  </div>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import AppRequest from '../../core/request/AppRequest';
import util from '../../core/helper/util';

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
        "gasLimit": "",
        "gasPrice": "",
        "gasUsed": "",
        "makerFee": "0",
        "takerFee": "0",
        "burnFees": "",
      }
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
      return moment(timestamp * 1000).format("dddd, MMMM Do YYYY, h:mm:ss a");
    },
    getTokenAmount (amount, symbol) {
      if (!amount || !symbol) {
        return null;
      }

      const tokenInfo = util.getTokenInfo(symbol);
      return util.formatTokenAmount(amount, tokenInfo.decimal);
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
