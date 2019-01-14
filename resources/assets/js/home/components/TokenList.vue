<template>
  <div class="col-sm-12">
    <div class="panel-heading pb-16">
      <span class="no-margin panel-title">{{$t('navigator.top_token')}} </span>
    </div>

    <b-card no-body>
      <div class="chart-period-picker">
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
          <chart-token
            ref="chartToken"
            :elementId="'chart-token'">
          </chart-token>
        </b-tab>
      </b-tabs>
    </b-card>

    <div class="panel-heading pt-56 pb-16">
      <span class="no-margin panel-title">{{ $t("common.all_token") }}</span>
    </div>


    <data-table v-if="($mq == 'md' || $mq == 'lg')" ref="datatable"
        :title="getListTitle()"
        :getData="getList">
      <template slot="header">
        <!-- <th class="text-center">{{ $t("token_list.no") }}</th> -->
        <th class="text-left pl-4">{{ $t("common.name") }}</th>
        <th class="text-left ">{{ $t("common.symbol") }}</th>
        <th class="text-left pl-4">{{ $t("common.volume_24h_usd") }}</th>
        <th class="text-left pl-4">{{ $t("common.volume_24h_eth") }}</th>
        <th ></th>
        <!-- <th class="text-right">{{ $t("common.volume_24h_token") }}</th> -->
        <!-- <th></th> -->
      </template>

      <template slot="body" scope="slot">
        <tr>
          <!-- <td class="text-center">{{ (slot.index + 1) }}</td> -->
            <td class="pl-4">
                <div class="token-name">
                    <img class="image-inline-td mr-1" :src="tokenIcons[slot.item.symbol] || getTokenImageLink(slot.item.symbol)" />
                    <span v-if="slot.item.official && slot.item.name">{{ slot.item.name }}</span>
                    <span v-if="!slot.item.official || !slot.item.name"><a class="address-link" :href="getAddressLink(slot.item.address)" target="_blank">{{getShortedAddr(slot.item.address)}}</a></span>
                    <span v-bind:class="{ fresher: slot.item.isNewToken, delised: slot.item.isDelisted }"></span>
                    <span v-bind:class="{ tooltiptext: slot.item.isNewToken || slot.item.isDelisted }">{{ slot.item.isNewToken || slot.item.isDelisted ? slot.item.isNewToken ? $t("tooltip.new_coin") : $t("tooltip.delisted")  :"" }}</span>
                </div>
            </td>
          <td  class="text-left pl-1">{{ slot.item.official ? slot.item.symbol : ''}}</td>
          <td class="text-left pl-5" >{{ formatVolumeUSD(slot.item) }}</td>
          <td class="text-left pl-5">{{ slot.item.volumeETH }}</td>
          <!-- <td class="text-right">{{ slot.item.volumeToken }}<span class="td-inline-symbol">{{ slot.item.symbol }}</span></td>
          <td><span class="pull-right">
              <i class="k k-angle right"></i>
            </span></td> -->
          <td class="pointer text-right pr-5" @click="toTokenDetails(slot.item.symbol)">
            <!-- <img src="/images/more.svg" /> -->
            <span class="entypo-dot-3 table-more"></span>
          </td>
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
        <tr @click="toTokenDetails(slot.item.symbol)">
          <td  class="text-left pl-4" style="white-space:nowrap !important">
              <div class="token-name">
                  <span>
                    <span v-if="slot.item.official && slot.item.symbol">{{ slot.item.symbol }}</span>
                    <span v-else>
                      <a class="address-link" :href="getAddressLink(slot.item.address)" target="_blank">{{getShortedAddr(slot.item.address)}}</a>
                    </span>
                  </span>
                  
                  <span v-bind:class="{ fresher: slot.item.isNewToken , delised: slot.item.isDelisted }"></span>
                  <span v-bind:class="{ tooltiptext: slot.item.isNewToken || slot.item.isDelisted }">{{ slot.item.isNewToken || slot.item.isDelisted ? slot.item.isNewToken ? "New Token List" : "Token is Delisted" :"" }}</span>
              </div>
          </td>
          <td class="text-right pr-4">{{ formatVolumeUSD(slot.item) }}</td>
          <td class="text-right pr-4">{{ slot.item.volumeETH }}</td>
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
const GLOBAL_TOKENS = window["GLOBAL_STATE"].tokens

export default {

  data() {
    return {
      tokens: _.keyBy(_.values(GLOBAL_TOKENS), 'symbol'),
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
      return util.shouldShowToken(item.symbol)
    },

    // isNewToken(item) {
    //   return util.isNewToken(item.symbol);
    // },
    formatVolumeUSD (item) {
      return '$' + (new BigNumber(item.volumeUSD.toString())).toFormat(2);
    },
    getTokenImageLink (symbol) {
      // let icon = typeof this.tokens[symbol].icon !== 'undefined' ? this.tokens[symbol].icon : (symbol.toLowerCase() + ".svg");
      // // if (!this.tokens[symbol].hidden) {
      // //   return 'images/tokens/' + icon;
      // // }
      // return "https://raw.githubusercontent.com/KyberNetwork/KyberWallet/master/src/assets/img/tokens/" +
      //    icon + "?sanitize=true";
      if(!this.tokenIcons[symbol]){
        this.tokenIcons[symbol] = util.getTokenIcon(symbol, this.tokens[symbol].icon, (replaceUrl) => {
          this.tokenIcons[symbol] = replaceUrl
        })
      }
       
      return this.tokenIcons[symbol]

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
  }

}
</script>

<style scoped lang="css">
</style>
