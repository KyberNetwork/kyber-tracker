<template>
  <div class="col-sm-12">
    <div class="panel-heading pb-20">
      <span class="no-margin panel-title">{{$t('navigator.top_token')}} </span>
    </div>

    <b-card no-body>
      <div class="chart-period-picker" v-if="$mq !== 'sm'">
        <b-button-group class="cus-pagination full-width-btn-group">
          <b-button
            :variant="selectedPeriod === 'H24' ? 'active' : ''"
            @click="selectPeriod('H24', 'H1')">24H
          </b-button>
          <b-button
            :variant="selectedPeriod === 'D7' ? 'active' : ''"
            @click="selectPeriod('D7', 'H1')">7D
          </b-button>
          <b-button
            :variant="selectedPeriod === 'D30' ? 'active' : ''"
            @click="selectPeriod('D30', 'D1')">1M
          </b-button>
          <b-button
            :variant="selectedPeriod === 'Y1' ? 'active' : ''"
            @click="selectPeriod('Y1', 'D1')">1Y
          </b-button>
          <b-button
            :variant="selectedPeriod === 'ALL' ? 'active' : ''"
            @click="selectPeriod('ALL', 'D1')">ALL
          </b-button>
        </b-button-group>
      </div>
      <b-tabs card>
        <b-tab :title="$t('chart.title.top_token')">


          <div class="chart-period-picker pt-3 text-right pr-3" v-if="$mq !== 'sm'">
            <b-button-group class="cus-pagination full-width-btn-group">
              <b-button
                :variant="selectedPeriod === 'H24' ? 'active' : ''"
                @click="selectPeriod('H24', 'H1')">24H
              </b-button>
              <b-button
                :variant="selectedPeriod === 'D7' ? 'active' : ''"
                @click="selectPeriod('D7', 'H1')">7D
              </b-button>
              <b-button
                :variant="selectedPeriod === 'D30' ? 'active' : ''"
                @click="selectPeriod('D30', 'D1')">1M
              </b-button>
              <b-button
                :variant="selectedPeriod === 'Y1' ? 'active' : ''"
                @click="selectPeriod('Y1', 'D1')">1Y
              </b-button>
              <b-button
                :variant="selectedPeriod === 'ALL' ? 'active' : ''"
                @click="selectPeriod('ALL', 'D1')">ALL
              </b-button>
            </b-button-group>
          </div>


          <chart-token
            ref="chartToken"
            :elementId="'chart-token'">
          </chart-token>
        </b-tab>
      </b-tabs>
    </b-card>

    <div class="panel-heading pt-56 pb-20">
      <span class="no-margin panel-title">{{ $t("common.all_token") }}</span>
    </div>


    <data-table v-if="($mq == 'md' || $mq == 'lg')" ref="datatable"
        :title="getListTitle()"
        :getData="getList">
      <template slot="header">
        <!-- <th class="text-center">{{ $t("token_list.no") }}</th> -->
        <th class="text-left pl-3">{{ $t("common.symbol") }}</th>
        <th class="text-left pl-5">{{ $t("common.name") }}</th>
        
        <th class="text-left pl-4">{{ $t("common.volume_24h_usd") }}</th>
        <th class="text-left pl-4">{{ $t("common.volume_24h_eth") }}</th>
        <th ></th>
        <!-- <th class="text-right">{{ $t("common.volume_24h_token") }}</th> -->
        <!-- <th></th> -->
      </template>

      <template slot="body" scope="slot">
        <tr class="pointer" @click="toTokenDetails(slot.item.address)">
          <!-- <td class="text-center">{{ (slot.index + 1) }}</td> -->
          <td  class="text-left pl-3">
            <img class="image-inline-td mr-1" :src="tokenIcons[slot.item.symbol] || getTokenImageLink(slot.item)" />
            {{ slot.item.official ? slot.item.symbol : ''}}
            
          </td>

          <td class="pl-5">
              <div class="token-name">
                  
                  <span v-if="slot.item.official && slot.item.name">{{ slot.item.name }}</span>
                  <span v-if="!slot.item.official || !slot.item.name"><a class="address-link indicator" @click="toTokenDetails(slot.item.address)">{{getShortedAddr(slot.item.address)}}</a></span>
                  <span v-bind:class="{ fresher: slot.item.isNewToken, delised: slot.item.isDelisted }"></span>
                  <span v-bind:class="{ tooltiptext: slot.item.isNewToken || slot.item.isDelisted }">{{ slot.item.isNewToken || slot.item.isDelisted ? slot.item.isNewToken ? $t("tooltip.new_coin") : $t("tooltip.delisted")  :"" }}</span>
              </div>
          </td>
          
          <td class="text-left pl-5" >{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
          <td class="text-left pl-5">{{ formatVolumn(slot.item.volumeETH) }}</td>


          <!-- <td class="pointer text-right pr-5" >
            <span class="entypo-dot-3 table-more"></span>
          </td> -->
        </tr>
      </template>
    </data-table>

    <data-table v-if="($mq !== 'md' && $mq !== 'lg')" ref="datatable" class="small-table table-hover"
        :title="getListTitle()"
        :getData="getList">
      <template slot="header">
        <th class="text-left pl-4">{{ $t("common.symbol") }}</th>
        <th class="text-right pr-4">{{ $t("common.volume_24h_usd") }}</th>
        <th class="text-right pr-4">{{ $t("common.volume_24h_eth") }}</th>
      </template>

      <template slot="body" scope="slot" v-if="shouldShowToken(slot.item)">
        <tr @click="toTokenDetails(slot.item.address)">
          <td  class="text-left pl-4" style="white-space:nowrap !important">
              <div class="token-name">
                  <span>
                    <span v-if="slot.item.official && slot.item.symbol">{{ slot.item.symbol }}</span>
                    <span v-else>
                      <a class="address-link indicator" @click="toTokenDetails(slot.item.address)">{{getShortedAddr(slot.item.address)}}</a>
                    </span>
                  </span>
                  
                  <span v-bind:class="{ fresher: slot.item.isNewToken , delised: slot.item.isDelisted }"></span>
                  <span v-bind:class="{ tooltiptext: slot.item.isNewToken || slot.item.isDelisted }">{{ slot.item.isNewToken || slot.item.isDelisted ? slot.item.isNewToken ? "New Token List" : "Token is Delisted" :"" }}</span>
              </div>
          </td>
          <td class="text-right pr-4">{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
          <td class="text-right pr-4">{{ formatVolumn(slot.item.volumeETH) }}</td>
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
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens

export default {

  data() {
    return {
      tokens: TOKENS_BY_ADDR,
      selectedPeriod: 'D30',
      selectedInterval: 'D1',
      tokenIcons: {}
    };
  },

  methods: {
    refresh () {
      this.$refs.datatable.fetch();
      this.refreshTopTopkensChart(this.selectedPeriod);
    },
    getListTitle () {
      return '';
    },
    getAddressLink(addr){
      return network.endpoints.ethScan + "address/" + addr;
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 9, 8)
    },
    selectPeriod(period, interval) {
      this.selectedPeriod = period;
      this.selectedInterval = interval;
      this.refreshTopTopkensChart(this.selectedPeriod);
    },

    getList () {
      const now = Date.now() / 1000 | 0;
      const timeStamp = this.$route.query.timeStamp
      
      const requestParams = {
        fromDate: now - 24 * 60 * 60,
        toDate: now,
      }
      if(timeStamp) requestParams.timeStamp = timeStamp
      return AppRequest.getTokens(requestParams);
    },

    shouldShowToken (item) {
      // return !this.tokens[item.symbol].hidden;
      return util.shouldShowToken(item.address)
    },

    // isNewToken(item) {
    //   return util.isNewToken(item.symbol);
    // },
    formatVolumn(number){
      return (new BigNumber(number.toString())).toFormat(2)
    },
    getTokenImageLink (token) {
      // let icon = typeof this.tokens[symbol].icon !== 'undefined' ? this.tokens[symbol].icon : (symbol.toLowerCase() + ".svg");
      // // if (!this.tokens[symbol].hidden) {
      // //   return 'images/tokens/' + icon;
      // // }
      // return "https://raw.githubusercontent.com/KyberNetwork/KyberWallet/master/src/assets/img/tokens/" +
      //    icon + "?sanitize=true";
      if(!this.tokenIcons[token.address]){
        if(!this.tokens[token.address.toLowerCase()] || !this.tokens[token.address.toLowerCase()].symbol) {
          this.tokenIcons[token.address] = "/images/tokens/unknown-token.svg"
        } else {
          this.tokenIcons[token.address] = util.getTokenIcon(this.tokens[token.address.toLowerCase()].symbol, (replaceUrl) => {
            this.tokenIcons[token.address] = replaceUrl
          })
        }
      }
       
      return this.tokenIcons[token.address]

    },
    
    toTokenDetails (symbol) {
      const tokenInfo = this.tokens[symbol];
      if (!tokenInfo) {
        return;
      }

      this.$router.push({
        name: 'token-details',
        params: {
          tokenAddr: tokenInfo.address
        }
      });
    },
    refreshTopTopkensChart(period) {
      if (this.$refs.chartToken) {
        this.$refs.chartToken.refresh(period);
      }
    },

    beforeDestroy() {
      window.clearInterval(this._refreshInterval);
    }
  },

  watch: {

  },

  mounted() {
    this._refreshInterval = window.setInterval(() => {
        this.refresh();
      }, 10000);
    this.refresh();
  },

  destroyed(){
    window.clearInterval(this._refreshInterval)
  }

}
</script>

<style scoped lang="css">
</style>
