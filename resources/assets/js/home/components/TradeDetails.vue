<template>
  <div class="trade-details-container col-md-10 col-12">
    <div class="panel-heading pb-20">
      <span class="no-margin panel-title">{{$t('navigator.trade_details')}} </span>
    </div>

    <div class="col-12 background-detail">
      <b-row>
        <b-col sm="12 left-trade-detail">

          <div class="trade-tx-hash">
            <div class="trade-detail-title">{{ $t("trade_detail.transaction_hash") }}</div>
            <div class="trade-detail-link pt-2">
              <a target="_blank" :href="getTxEtherscanLink(record.tx)">{{ record.tx }}</a>
            </div>
          </div>
          <div class="trade-time pt-2 pb-4">
            <!-- <span class="entypo-clock"></span>  -->
            {{ getDateInfo(record.blockTimestamp) }}
          </div>
          <div class="trade-detail-wrapper">
           

            <div class="left-trade-rate d-flex justify-content-around">
              <div class="token col-5">
                <span class="token-symbol font-semi-bold">
                  <span class="token-symbol">{{ getTokenAmount(record.takerTokenAmount, record.takerTokenAddress) }}</span>
                  <token-link class="token-link" :address="record.takerTokenAddress"></token-link>
                </span>
              </div>
              <!-- <span class="to">to</span> -->
              <span class="entypo-right col-2 color-green"></span>
              <div class="token col-5">
                <span class="token-symbol font-semi-bold">
                  <span>{{ getTokenAmount(record.makerTokenAmount, record.makerTokenAddress) }}</span>
                  <token-link class="token-link" :address="record.makerTokenAddress"></token-link>
                </span>
              </div>
              
            </div>
            
            <div v-if="record.volumeUsd" class="trade-note pt-3">
              {{ $t("trade_detail.trade_note", [formatFiatCurrency(record.volumeUsd)]) }}
            </div>


            <div class="rate-detail pt-4 pb-4 d-flex justify-content-between">
              <div class="rate">
                <div class="rate-detail-title">
                  <!-- <token-link class="token-link" :symbol="record.takerTokenSymbol"></token-link>/<token-link class="token-link" :symbol="record.makerTokenSymbol"></token-link> 
                  RATE -->
                  {{$t("trade_detail.rate", [
                  isOfficial(record.takerTokenAddress) ? record.takerTokenSymbol : getShortedAddr(record.takerTokenAddress), 
                  isOfficial(record.makerTokenAddress) ? record.makerTokenSymbol : getShortedAddr(record.makerTokenAddress)
                  ])}}
                </div>
                <div class="rate-detail-value">
                  <!-- {{ Math.round(1/getRate(record)*100000000) / 100000000 }} -->
                  {{getRate(record)}}
                </div>
                
              </div>
              <div class="collected">
                <div class="rate-detail-title">
                  {{$t("trade_detail.collected_fees")}}
                </div>
                <div class="rate-detail-value">
                  {{ getTokenAmount(record.collectedFees, KNCAddr() ) }} KNC
                </div>
                
              </div>
              <div v-if="$route.query.partner" class="commision">
                <div class="rate-detail-title">
                  {{$t("trade_detail.commission")}}
                </div>
                <div class="rate-detail-value">
                  {{ getTokenAmount(record.commission, KNCAddr() ) }} KNC
                </div>
                
              </div>
            </div>

            <div class="trade-wallet pb-4">
              <div class="trade-detail-title">{{ $t("trade_detail.wallet") }}</div>
              <div class="trade-detail-link">
                <router-link class="trade-detail-link" :to="`/search?q=${record.takerAddress}`">{{ record.takerAddress }}</router-link>
              </div>
              
            </div>
          </div>
          


          


        </b-col>
      </b-row>

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
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens

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
      tokens: TOKENS_BY_ADDR
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
    isOfficial(address = ''){
      return util.isOfficial(TOKENS_BY_ADDR[address.toLowerCase()])
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
    getTokenAmount(amount, address) {
      if (!amount || !address) {
        return null;
      }

      const tokenInfo = util.getTokenInfo(address.toLowerCase());
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
      if (!this.record.makerTokenAddress || !this.record.takerTokenAddress) {
        return "";
      }

      const makerToken = this.tokens[this.record.makerTokenAddress];
      const takerToken = this.tokens[this.record.takerTokenAddress];

      if(!makerToken || !takerToken) return ''

      const bigMakerTokenAmount = new BigNumber(
        this.record.makerTokenAmount.toString()
      )

      const bigTakerTokenAmount = new BigNumber(
        this.record.takerTokenAmount.toString()
      )

      // const bigRate = bigMakerTokenAmount.div(bigTakerTokenAmount).times(Math.pow(10, takerToken.decimal - makerToken.decimal ))
      // console.log("--------", makerAmount.toString(), takerAmount.toString())
      // console.log("============= rouding rate", bigMakerTokenAmount.div(bigTakerTokenAmount).toString())
      // console.log("++++++++++++ rate", bigRate.toString(), takerToken.decimal, makerToken.decimal, this.record.makerTokenAmount, this.record.takerTokenAmount, bigMakerTokenAmount.toString(), bigTakerTokenAmount.toString())

      
      const makerAmount = bigMakerTokenAmount.div(Math.pow(10, makerToken.decimal));
      
      const takerAmount = bigTakerTokenAmount.div(Math.pow(10, takerToken.decimal));

      
      const bigRate = makerAmount.div(takerAmount)

      console.log("++++++++++", makerAmount.toString(), takerAmount.toString(), bigRate.isZero(), bigRate.isNaN(), bigRate.isFinite(), bigRate.toString())
      
      if(!bigRate.isZero() && !bigRate.isNaN() && !bigRate.isFinite() && !takerAmount.isZero()) return util.roundingNumber(bigRate.toString());

      console.log("********** new big rate")
      
      // const newBigRate = bigMakerTokenAmount.div(bigTakerTokenAmount).times(Math.pow(10, takerToken.decimal - makerToken.decimal ))
      const newBigRate =( bigMakerTokenAmount.times(Math.pow(10, takerToken.decimal)) ).div(   bigTakerTokenAmount.times(Math.pow(10, makerToken.decimal))  )
      return util.roundingNumber(newBigRate.toString());

    },
    formatFiatCurrency(amount) {
      return util.formatFiatCurrency(amount);
    },
    KNCAddr(){
      return network.KNC.address
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
