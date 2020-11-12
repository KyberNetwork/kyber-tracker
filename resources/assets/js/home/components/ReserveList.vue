<template>
  <div class="col-sm-12 reserve-list-container">
    <div class="panel-heading pb-20">
      <span class="no-margin panel-title">{{$t('navigator.reserves')}} </span>
    </div>

    <data-table v-if="isAllTokens()" :rows="displayReserveList">
      <template slot="header">
        <th class="text-left pl-4">{{ $t("common.address") }}</th>
        <th class="text-left pl-4">{{ $t("common.type") }}</th>
        <th class="text-left pl-4">{{ $t("common.volume_24h_usd") }}</th>
        <th v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-4">{{ $t("common.volume_24h_eth") }}</th>
        <th class="text-left pl-4"></th>
      </template>

      <template slot="body" scope="slot">
        <tr  @click="toReserveDetails(slot.item.address)" class="pointer">
            <td class="pl-4 reserve-name" >
              <a class="address-link" >{{getReservename(slot.item)}}</a>
              <span v-bind:class="{ delised: slot.item.isDelisted }"></span>
              <span v-bind:class="{ tooltiptext: slot.item.isDelisted }">{{ slot.item.isDelisted ? $t("tooltip.delisted")  :"" }}</span>
            </td>
          <td class="reserve-type text-center">
            <span v-bind:class="getReserveType(slot.item).toLowerCase()">
              {{ getReserveType(slot.item) }}
            </span>
            </td>
          <td class="text-left pl-5" >{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
          <td v-if="$mq !== 'sm' && $mq !== 'ml'"  class="text-left pl-5">{{ formatVolumn(slot.item.volumeETH) }}</td>
          <td v-if="$mq !== 'sm' && $mq !== 'ml'"  class="text-left">{{ slot.item.status=='maintenance' ? slot.item.status : '' }}</td>
        </tr>
      </template>
    </data-table>

    <data-table v-else :rows="displayReserveList">
      <template slot="header">
        <th class="text-left pl-4">{{ $t("common.address") }}</th>
        <th class="text-left pl-4">{{ $t("common.type") }}</th>
        <th class="text-left pl-4">{{ $t("common.volume_24h_usd") }}</th>
        <th v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-4">{{ $t("common.volume_24h_eth") }}</th>
        <th class="text-left pl-4"></th>
      </template>

      <template slot="body" scope="slot">
        <tr @click="toReserveDetails(slot.item.address)" class="pointer">
            <td class="pl-4 reserve-name">
              <a class="address-link">{{getReservename(slot.item.address)}}</a>
              <span v-bind:class="{ delised: slot.item.isDelisted }"></span>
              <span v-bind:class="{ tooltiptext: slot.item.isDelisted }">{{ slot.item.isDelisted ? $t("tooltip.delisted")  :"" }}</span>
            </td>
          <td class="reserve-type text-center" >
            <span v-bind:class=" getReserveType(slot.item).toLowerCase()">
              {{ getReserveType(slot.item) }}
            </span>
            
            </td>
          <td class="text-left pl-5" >{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
          <td v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-5">{{ formatVolumn(slot.item.volumeETH) }}</td>
          <td v-if="$mq !== 'sm' && $mq !== 'ml'"  class="text-left">{{ slot.item.status=='maintenance' ? slot.item.status : '' }}</td>
        </tr>
      </template>
    </data-table>

    <div class="text-center">
      <button type="button" class="btn btn-default see-all-trade mx-auto" @click="toggleSeeAll()">{{seeAll ? $t("common.see_less") : $t("common.see_all") }}</button>
    </div>


    <!-- <b-tabs>
      <b-tab :title="$t('reserves.all') " active>
        <data-table :rows="getReserveByType('all')">
          <template slot="header">
            <th class="text-left pl-4">{{ $t("common.address") }}</th>
            <th class="text-left pl-4">{{ $t("common.volume_24h_usd") }}</th>
            <th v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-4">{{ $t("common.volume_24h_eth") }}</th>
          </template>

          <template slot="body" scope="slot">
            <tr>
                <td class="pl-4 pointer"  @click="toReserveDetails(slot.item.address)">
                  <a class="address-link" >{{getReservename(slot.item.address)}}</a>
                </td>
              <td class="text-left pl-5" >{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
              <td v-if="$mq !== 'sm' && $mq !== 'ml'"  class="text-left pl-5">{{ formatVolumn(slot.item.volumeETH) }}</td>
             
            </tr>
          </template>
        </data-table>

      </b-tab>
      <b-tab :title="$t('reserves.verified') " >
        <data-table :rows="getReserveByType('offical')">
          <template slot="header">
            <th class="text-left pl-4">{{ $t("common.address") }}</th>
            <th class="text-left pl-4">{{ $t("common.volume_24h_usd") }}</th>
            <th v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-4">{{ $t("common.volume_24h_eth") }}</th>
          </template>

          <template slot="body" scope="slot">
            <tr @click="toReserveDetails(slot.item.address)" class="pointer">
                <td class="pl-4">
                  <a class="address-link">{{getReservename(slot.item.address)}}</a>
                </td>
              <td class="text-left pl-5" >{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
              <td v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-5">{{ formatVolumn(slot.item.volumeETH) }}</td>
             
            </tr>
          </template>
        </data-table>
      </b-tab>
      <b-tab :title="$t('reserves.permisionless') ">
        <data-table :rows="getReserveByType('permissionless')">
          <template slot="header">
            
            <th class="text-left pl-4">{{ $t("common.address") }}</th>
            <th class="text-left pl-4">{{ $t("common.volume_24h_usd") }}</th>
            <th v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-4">{{ $t("common.volume_24h_eth") }}</th>
          </template>

          <template slot="body" scope="slot">
            <tr @click="toReserveDetails(slot.item.address)" class="pointer">
                <td class="pl-4">
                  <a class="address-link">{{getReservename(slot.item.address)}}</a>
                </td>
              <td class="text-left pl-5" >{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
              <td v-if="$mq !== 'sm' && $mq !== 'ml'" class="text-left pl-5">{{ formatVolumn(slot.item.volumeETH) }}</td>
            </tr>
          </template>
        </data-table>
      </b-tab>
    </b-tabs> -->


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
import store from "../../core/helper/store";
import Chart from 'chart.js';
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens


const reserveName = _.transform(network.reserves, (r, v, k) => {r[k.toLowerCase()] = v})

export default {

  data() {
    return {
      tokens: TOKENS_BY_ADDR,
      selectedPeriod: 'D30',
      selectedInterval: 'D1',
      tokenIcons: {},
      reserveList: [],
      displayReserveList: [],
      seeAll: true
    };
  },

  methods: {
    refresh () {
      // this.$refs.datatable.fetch();
      // this.refreshTopTopkensChart(this.selectedPeriod);
      this.getList().then(data => {
        this.reserveList = data
        this.displayReserveList = this.reserveList.filter(x => x.volumeETH)
      })
    },

    toggleSeeAll(){
      this.seeAll = !this.seeAll
      if(this.seeAll){
        this.displayReserveList = this.reserveList
      } else {
        this.displayReserveList = this.reserveList.filter(x => x.volumeETH)
      }
    },
    getListTitle () {
      return '';
    },

    getReserveByType(type){
      switch (type) {
        case 'all':
          return this.reserveList
          break;
        case 'offical':
          return this.reserveList.filter(i => i.type == '1')
          break;
        case 'permissionless':
          return this.reserveList.filter(i => i.type == '2')
          break;
        default:
          return []
      }
    },

    getAddressLink(addr){
      return network.endpoints.ethScan + "address/" + addr;
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 9, 8)
    },
    getReservename(item){
      const reserveAddrLower = item.address.toLowerCase()
      const reserveData = reserveName[reserveAddrLower]
      if(reserveData){
        return reserveData[0].toUpperCase()
      }

      if(item.info) return item.info.name.toUpperCase()

      return util.shortenAddress(reserveAddrLower, 9, 8)

      
    },
    getReserveType(item){
      if(item.info) return item.info.type

      const reserveAddrLower = item.address.toLowerCase()
      const reserveData = reserveName[reserveAddrLower]
      if(!reserveData || !reserveData[1]) return "-/-"

      return reserveData[1]
    },

    getReserveTypeStyleClass(item){
      const reserveType = this.getReserveType(item)

      if(reserveType == "BR") return ""
      else if (reserveType == "APR") return ""
      else if (reserveType == "FPR")  return ""



      return ""

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
      return AppRequest.getReserveList(requestParams);
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
    
    toReserveDetails (address) {
      this.$router.push({
        name: 'reserve-details',
        params: {
          reserveAddr: address
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
    },
    isAllTokens() {
      return store.get("kyber-official-network") ? false : true;
    },
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
