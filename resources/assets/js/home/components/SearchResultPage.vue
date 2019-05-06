<template>

  <div class="panel panel-default trade-list search-result w-100">

    <div v-if="!!title" class="panel-heading pt-56 pb-16">
      <span class="panel-title no-margin"> {{ title }} </span>
    </div>



    <div v-if="searchResult" class="clear pb-10">


      <div v-if="searchResult.error" class="text-center pb-4">
        <!-- {{searchResult.error}} -->
        <oop :notFoundString="searchResult.error">
        </oop>
      </div>
      

      <div v-if="searchResult.isValid && searchResult.data">          

        <div class="panel-heading pb-20">
          <span v-if="!partner" class="no-margin panel-title">{{$t('wallet_detail.wallet_detail')}} </span>
          <span v-else class="no-margin panel-title">{{$t('wallet_detail.partner_details')}} </span>


          <div v-if="!isHideDatepicker" class="datepicker-container pb-16 ">
            <!-- <span>{{ $t('filter.from') }}</span> -->
            <datepicker v-model="searchFromDate" name="searchFromDate" class="calendar-icon from"
              :language="locale"
              :format="formatDatepicker"
              :clear-button="true"
              :highlighted="highlightedToday"
              :disabled="disabledFromDates"
              :placeholder="$t('filter.from')"
              >
            </datepicker>
            <!-- <span>{{ $t('filter.to') }}</span> -->
            <datepicker v-model="searchToDate" name="searchToDate" class="calendar-icon to ml-2"
              :language="locale"
              :format="formatDatepicker"
              :clear-button="true"
              :highlighted="highlightedToday"
              :disabled="disabledToDates"
              :placeholder="$t('filter.to')"
              >
            </datepicker>
          </div>
        </div>

        <!-- address detail ################## -->
        <div class="address-detail-container">
          <div class="wallet-title">
            {{$t('wallet_detail.address')}}:
            <a class="wallet-address" target="_blank" :href="getAddressEtherscanLink(searchResult.data.query)">{{ searchResult.data.query }}</a>
          </div>

          <div class="wallet-value vdivide row mt-4 mr-0 ml-0">
            <div class="col border-right wallet-column">
              <div class="row">
                  <div class="col">
                  <div class="value-label">
                    {{$t('wallet_detail.trades')}}
                  </div>
                  <div class="font-semi-bold pt-2">
                    {{searchResult.data.numberTrades || '0'}}
                  </div>
                </div>

                <div class="col">
                  <div class="value-label">
                    {{$t('wallet_detail.collected_fees')}}
                  </div>
                  <div class="font-semi-bold pt-2">
                    {{searchResult.data.totalCollectedFees || '0'}} KNC
                  </div>
                </div>

                <div v-if="partner" class="col">
                  <div class="value-label">
                    {{$t('wallet_detail.commission')}}
                  </div>
                  <div class="font-semi-bold pt-2">
                    {{searchResult.data.commission || '0'}} KNC
                  </div>
                </div>
              </div>
            </div>

            <div class="col wallet-column">
              <span>
                Total Trading Volume
              </span>
              <div class="row">
                <div class="col pt-2">
                  <!-- <div class="value-number">
                    {{searchResult.data.totalEth}}
                  </div>
                  <div class="value-label">
                    {{$t('wallet_detail.eth')}}
                  </div> -->
                  {{$t('wallet_detail.eth')}}
                  <span class="font-semi-bold">{{searchResult.data.totalEth}}</span>
                </div>

                <div class="col pt-2">
                  <!-- <div class="value-number">
                    {{searchResult.data.totalUsd}}
                  </div>
                  <div class="value-label">
                    {{$t('wallet_detail.udd')}}*
                  </div> -->
                  {{$t('wallet_detail.usd')}}*
                  <span class="font-semi-bold">{{searchResult.data.totalUsd}}</span>
                </div>
              </div>
              
              <div class="walet-note pt-3">
                *{{$t('wallet_detail.notice')}}
              </div>

              
            </div>

          </div>


          <!-- <div class="wallet-title">
            {{$t('wallet_detail.total_trading_volune')}}
          </div>

          <div class="row wallet-value vdivide">
            <div class="col border-right">
              <div class="value-number">
                {{searchResult.data.totalEth}}
              </div>
              <div class="value-label">
                {{$t('wallet_detail.value_in_eth')}}
              </div>
              
            </div>
            <div class="col">
              <div class="value-number">
                {{searchResult.data.totalUsd}}
              </div>
              <div class="value-label">
                {{$t('wallet_detail.value_in_usd')}}*
              </div>
              
            </div>
          </div> -->


          <!-- <div class="walet-note">
            *{{$t('wallet_detail.notice')}}
          </div> -->
        </div>

        <div class="wallet-detail-title panel-heading pt-56 pb-20 d-flex justify-content-between">
          <span class="no-margin panel-title">{{$t('wallet_detail.history')}} </span>

          <button type="button" class="btn btn-default btn-export pointer" @click="exportData()">{{ $t("trade_list.export_csv") }}</button>
        </div>

        


      </div>

    </div>
    
    
    <mini-trade-list 
      ref="datatable"
      :getFilterTokenAddress="getFilterTokenAddress"
      :fetch="requestSearch"
      :exportData="exportData"
      :isHideDatepicker="true"
      :getSearchResultTitle="getSearchResultTitle"
      :searchFromDate="searchFromDate"
      :searchToDate="searchToDate"
      :isShowExport="false"
      v-on:fetchDone="reloadView"
      :isParentLoading="isLoading"
    >
    </mini-trade-list>
    
  </div>

</template>

<script>
import _ from "lodash";
import io from "socket.io-client";
import moment,{ locale } from 'moment';
import BigNumber from "bignumber.js";
import AppRequest from "../../core/request/AppRequest";
import util from "../../core/helper/util";
import network from '../../../../../config/network';
const partners = network.partners
// import network from '../../../../../config/network';
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens;
import Chart from "chart.js";
// const tokens = network.tokens;

export default {
  data() {
    return {
      resultCount: 0,
      totalUsd: 0,
      totalEth: 0,
      totalCollectedFees: 0,
      // searchFromDate: moment().subtract(7, 'days').startOf('day').unix(),
      searchFromDate: null,
      searchToDate: null,
      tokens: TOKENS_BY_ADDR,
      isParentLoading: false,
      searchResult: {},
      highlightedToday: {
        dates: [new Date()]
      },
      disabledFromDates: {
        //
      },
      disabledToDates: {
        //
      }
    };
  },

  methods: {
    refresh() {
      if (!this.$refs.datatable) {
        return;
      }
      this.$refs.datatable.fetch();
    },

    getFilterTokenAddress() {
      return undefined;
    },
    getSearchResultTitle() {
      if (
        !util.isTxHash(this.$route.query.q) &&
        !util.isAddress(this.$route.query.q)
      ) {
        return "<span class='long-address'>" + this.$route.query.q + "</span>";
      }
      if (util.isTxHash(this.$route.query.q) && !this.resultCount) {
        return (
          "<span class='long-address'>" +
          this.$t("search_page.tx_hash") +
          '<a href="https://etherscan.io/tx/' +
          this.$route.query.q +
          '" target="blank">' +
          this.$route.query.q +
          "</a>"
        );
        ("</span>");
      }

      return (
        "<span class='long-address'>" +
        this.$t("search_page.result_title") +
        '<a href="https://etherscan.io/address/' +
        this.$route.query.q +
        '" target="blank">' +
        this.$route.query.q +
        "</a>"
      );
      ("</span>");
    },
    getAddressEtherscanLink(tx) {
      if(!util.isAddress(tx)) tx=partners[tx.toLowerCase()]
      return network.endpoints.ethScan + "address/" + tx;
    },
    getSearchResultMessage() {
      if (
        !util.isTxHash(this.$route.query.q) &&
        !util.isAddress(this.$route.query.q)
      ) {
        // this.$router.push(`/not-found`);
        // return;

        this.searchResult =  {
          isValid: false,
          error: this.$t("search_page.invalid_query"),
          data: null
        };

        console.log('********** ', this.searchResult)
        return;
      }

      if (util.isTxHash(this.$route.query.q) && !this.resultCount) {
        // this.$router.push(`/not-found`);
        // return;
        this.searchResult = {
          isValid: true,
          error: this.$t("search_page.no_txhash_data"),
          data: null
        };
        console.log('-------------- ', this.searchResult)
        return;
      }

      // let returnDiv = <span>
      //           {{resultMsg}}
      //           <br/>
      //           {{totalUsdMsg}}
      //           <br/>
      //           {{totalEthMsg}}
      //           <br/>
      //           {{totalPartnerFee}}
      //       </span>

      //       console.log(returnDiv)

      this.searchResult = {
        isValid: true,
        error: null,
        data: {
          numberTrades: this.resultCount,
          totalUsd: this.totalUsd,
          totalEth: this.totalEth,
          totalPartnerFee: this.totalPartnerFee,
          totalCollectedFees: this.totalCollectedFees,
          type: util.isAddress(this.$route.query.q) ? "address" : "txHash",
          query: this.$route.query.q
        }
      };
    },
    requestSearch(isShowLoading) {
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const q = this.$route.query.q;
      const fromDate = this.$refs.datatable.searchFromDate
        ? moment(this.$refs.datatable.searchFromDate)
            .startOf("day")
            .unix()
        : undefined;
      const toDate = this.$refs.datatable.searchToDate
        ? moment(this.$refs.datatable.searchToDate)
            .endOf("day")
            .unix()
        : undefined;
      if (isShowLoading) {
        this.isParentLoading = true;
        this.$refs.datatable.rows = [];
      }
      AppRequest.searchTrades(
        q,
        currentPage,
        pageSize,
        fromDate,
        toDate,
        false,
        (err, res) => {
          const data = res.data;
          if (data && data.id > 0) {
            this.$router.push(`/trades/${data.id}`);
            return;
          }

          const pagination = res.pagination;
          this.$refs.datatable.rows = data;

          if (pagination) {
            this.resultCount = pagination.totalCount;
            this.totalUsd = new BigNumber(
              pagination.volumeUsd.toString()
            ).toFormat(2);
            this.totalEth = new BigNumber(
              pagination.volumeEth.toString()
            ).toFormat(3);

            this.totalCollectedFees = new BigNumber(
              pagination.collectedFees.toString()
            )
              .div(Math.pow(10, 18))
              .toFormat(3);
            this.$refs.datatable.maxPage = pagination.maxPage;
          } else {
            this.resultCount = 0;
          }

          this.getSearchResultMessage()
          this.isParentLoading = false;
        }
      );
    },

    exportData() {
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const q = this.$route.query.q;
      const fromDate = this.$refs.datatable.searchFromDate
        ? moment(this.$refs.datatable.searchFromDate)
            .startOf("day")
            .unix()
        : undefined;
      const toDate = this.$refs.datatable.searchToDate
        ? moment(this.$refs.datatable.searchToDate)
            .endOf("day")
            .unix()
        : undefined;

      AppRequest.searchTrades(
        q,
        currentPage,
        pageSize,
        fromDate,
        toDate,
        true,
        (err, res) => {
          const data = res.data;
          var csvHeader = "data:text/csv;charset=utf-8,";
          var notice = "*USD Rates are calculated at transaction time\n";
          var csvContent = "";
          csvContent += data
            .map(function(d) {
              let time = new Date(+d.blockTimestamp * 1000)
                .toUTCString()
                .replace(",", "");
              let fromToken = d.takerTokenAddress;
              let fromAmount = TOKENS_BY_ADDR[fromToken]
                ? new BigNumber(d.takerTokenAmount.toString())
                    .div(Math.pow(10, TOKENS_BY_ADDR[fromToken].decimal))
                    .toString()
                : 0;

              let toToken = d.makerTokenAddress;
              let toAmount = TOKENS_BY_ADDR[toToken]
                ? new BigNumber(d.makerTokenAmount.toString())
                    .div(Math.pow(10, TOKENS_BY_ADDR[toToken].decimal))
                    .toString()
                : 0;

              // let rate = fromAmount.isZero() ? 0 : toAmount.div(fromAmount)
              let usdAmount = d.volumeUsd ? d.volumeUsd.toString() : 0;

              return `${time},${fromToken},${fromAmount},${toToken},${toAmount},${usdAmount}`;
            })
            .join("\n")
            .replace(/(^\{)|(\}$)/gm, "");
          let csvData =
            csvHeader +
            notice +
            "Time,From Token,From Amount,To Token,To Amount,USD Value*\n" +
            csvContent;

          // window.open( encodeURI(csvData) );
          let dataCSV = encodeURI(csvData);

          let link = document.createElement("a");
          link.href = dataCSV;
          link.target = "_blank";
          link.download = new Date().toUTCString() + " " + q + ".csv";

          document.body.appendChild(link);
          link.click();
        }
      );
    },

    formatDatepicker (date) {
      switch (util.getLocale()) {
        case 'vi':
          return moment(date).format('DD/MM/YYYY');
          break;
        case 'ko':
          return moment(date).format('YYYY MM DD');
          break;
      
        default:
          return moment(date).format('DD MMM YYYY');
          break;
      }
    },
  },

  computed: {
    locale() {
      return util.getLocale();
    }
  },

  watch: {
    "$route.query"() {
      this.refresh();
    },
    searchFromDate (val) {

      // this.$emit('changeDate')
      // this.resetPagingate()
      // const fromDate = val ? val.getTime() : 0;
      // const toDate = this.searchToDate ? this.searchToDate.getTime() : 0;

      // if (fromDate > 0 && toDate > 0 && fromDate > toDate) {
      //   window.EventBus.$emit('EVENT_COMMON_ERROR', `From-date must be equal or less than to-date`);
      //   window.setTimeout(() => {
      //     this.searchFromDate = null;
      //   });
      //   return;
      // }

      window.setTimeout(() => {
        this.disabledToDates = { to: this.searchFromDate };
        // this.fetch(true);
      });
    },
    searchToDate (val) {
      // this.$emit('changeDate')
      // this.resetPagingate()
      // const toDate = val ? val.getTime() : 0;
      // const fromDate = this.searchFromDate ? this.searchFromDate.getTime() : 0;
      // if (fromDate > 0 && toDate > 0 && fromDate > toDate) {
      //   window.EventBus.$emit('EVENT_COMMON_ERROR', `To-date must be equal or greater than from-date`);
      //   window.setTimeout(() => {
      //     this.searchToDate = null;
      //   });
      //   return;
      // }

      window.setTimeout(() => {
        this.disabledFromDates = { from: this.searchToDate };
        // this.fetch(true);
      });
    }
  },

  mounted() {
    this.refresh();
  }
};
</script>

<style scoped lang="css">
</style>
