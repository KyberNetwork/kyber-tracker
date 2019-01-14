<template>
  <div class="trade-details-container col-md-8 col-sm-10 col-12">
    <div class="panel-heading pb-16">
      <span class="no-margin panel-title">{{$t('navigator.trade_details')}} </span>
    </div>

    <div class="col-12 background-detail">
      <b-row>
        <b-col sm="12 left-trade-detail">
          <div class="trade-time">
            <span class="entypo-clock"></span> {{ getDateInfo(record.blockTimestamp) }}
          </div>

          <div class="left-trade-rate d-flex justify-content-around">
            <div class="token col-5">
              <span class="token-symbol">
                 <span class="token-symbol">{{ getTokenAmount(record.takerTokenAmount, record.takerTokenSymbol) }}</span>
                <token-link class="token-link" :symbol="record.takerTokenSymbol"></token-link>
              </span>
            </div>
            <!-- <span class="to">to</span> -->
            <span class="entypo-right to col-2"></span>
            <div class="token col-5">
              <span class="token-symbol">
                <span>{{ getTokenAmount(record.makerTokenAmount, record.makerTokenSymbol) }}</span>
                <token-link class="token-link" :symbol="record.makerTokenSymbol"></token-link>
              </span>
            </div>
            
          </div>
          
          <div v-if="record.volumeUsd" class="trade-note">
            <i>{{ $t("trade_detail.trade_note", [formatFiatCurrency(record.volumeUsd)]) }}</i>
          </div>
        </b-col>
        <b-col sm="12 right-trade-detail">
          <div class="trade-tx-hash">
            <div class="trade-detail-title">{{ $t("trade_detail.transaction_hash") }}</div>
            <div class="trade-detail-link">
              <a target="_blank" :href="getTxEtherscanLink(record.tx)">{{ record.tx }}</a>
            </div>
          </div>

          <div class="trade-detail-title">
            <div class="trade-detail-title">{{ $t("trade_detail.wallet") }}</div>
            <div class="trade-detail-link">
              <router-link class="trade-detail-link" :to="`/search?q=${record.takerAddress}`">{{ record.takerAddress }}</router-link>
            </div>
            
          </div>
        </b-col>
      </b-row>

    </div>

    <div class="row rate-detail">
      <div class="col">
        <div class="rate-detail-title">
          <!-- <token-link class="token-link" :symbol="record.takerTokenSymbol"></token-link>/<token-link class="token-link" :symbol="record.makerTokenSymbol"></token-link> 
          RATE -->
          {{$t("trade_detail.rate", [
          isOfficial(record.takerTokenSymbol) ? record.takerTokenSymbol : getShortedAddr(record.takerTokenAddress), 
          isOfficial(record.makerTokenSymbol) ? record.makerTokenSymbol : getShortedAddr(record.makerTokenAddress)
          ])}}
        </div>
        <div class="rate-detail-value">
          <!-- {{ Math.round(1/getRate(record)*100000000) / 100000000 }} -->
          {{getRate(record)}}
        </div>
        
      </div>
      <div class="col">
        <div class="rate-detail-title">
          {{$t("trade_detail.collected_fees")}}
        </div>
        <div class="rate-detail-value">
          {{ getTokenAmount(record.collectedFees, 'KNC') }} KNC
        </div>
        
      </div>
      <div v-if="$route.query.partner" class="col">
        <div class="rate-detail-title">
          {{$t("trade_detail.commission")}}
        </div>
        <div class="rate-detail-value">
          {{ getTokenAmount(record.commission, 'KNC') }} KNC
        </div>
        
      </div>
    </div>
    

  </div>
</template>

<script>
import _ from "lodash";
import io from "socket.io-client";
import moment from "moment";
import BigNumber from "bignumber.js";
import AppRequest from "../../core/request/AppRequest";
import util from "../../core/helper/util";
import network from "../../../../../config/network";
const GLOBAL_TOKENS = window["GLOBAL_STATE"].tokens

export default {
  data() {
    return {
      record: {
        blockNumber: "",
        blockHash: "",
        blockTimestamp: "",
        tx: "",
        makerAddress: "",
        makerTokenAddress: "",
        makerTokenSymbol: "",
        makerTokenAmount: "",
        takerAddress: "",
        takerTokenAddress: "",
        takerTokenSymbol: "",
        takerTokenAmount: "",
        volumeUsd: "",
        burnFees: ""
      },
      tokens: _.keyBy(_.values(GLOBAL_TOKENS), "symbol")
    };
  },

  methods: {
    refresh() {
      const id = this.$route.params.id;
      if (!id) {
        return;
      }
      AppRequest.getTradeDetails(id).then(data => {
        this.record = data;
      });
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 4, 4)
    },
    isOfficial(symbol){
      return util.isOfficial(GLOBAL_TOKENS[symbol])
    },
    getDateInfo(timestamp) {
      const locale = localStorage.getItem("locale") || "en";
      if (locale === "vi") {
        return moment(timestamp * 1000).format(
          "dddd, ngày Do/MM/YYYY, HH:mm:ss UTCZ"
        );
      } else {
        return moment(timestamp * 1000).format(
          "dddd, MMMM Do YYYY, HH:mm:ss UTCZ"
        );
      }
    },
    getTokenAmount(amount, symbol) {
      if (!amount || !symbol) {
        return null;
      }

      const tokenInfo = util.getTokenInfo(symbol);
      return util.formatTokenAmount(amount, tokenInfo.decimal, 6);
    },
    getTxEtherscanLink(tx) {
      return network.endpoints.ethScan + "tx/" + tx;
    },
    getAddressEtherscanLink(addr) {
      return network.endpoints.ethScan + "address/" + addr;
    },
    doSearch(q) {
      this.$router.push({
        name: "search",
        query: { q }
      });
    },
    getRate(trade) {
      if (!this.record.makerTokenSymbol || !this.record.takerTokenSymbol) {
        return "";
      }

      const makerToken = this.tokens[this.record.makerTokenSymbol];
      const takerToken = this.tokens[this.record.takerTokenSymbol];

      const makerAmount = new BigNumber(
        this.record.makerTokenAmount.toString()
      ).div(Math.pow(10, makerToken.decimal));
      
      const takerAmount = new BigNumber(
        this.record.takerTokenAmount.toString()
      ).div(Math.pow(10, takerToken.decimal));
      return util.roundingNumber(makerAmount.div(takerAmount).toNumber());
    },
    formatFiatCurrency(amount) {
      return util.formatFiatCurrency(amount);
    }
  },

  watch: {},

  mounted() {
    this.refresh();
  }
};
</script>

<style scoped lang="css">

</style>
