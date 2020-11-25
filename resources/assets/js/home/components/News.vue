<template>
  <div class="news-container container-fluid mt-4">
    <div class="row justify-content-center">
      <div v-if="!posts || !posts.length" class="trade-loading"><div></div><div></div><div></div></div>

      <div class="col-auto mb-3" v-for="(row, index) in posts" :item="row" :index="index">
        <div class="card" style="width: 20rem;" >
          <img class="card-img-top" :src="row.thumbnail" :alt="row.title" />
          <div class="card-body">
            <a :href="row.link" target="_blank">
                <h5 class="card-title" v-html="row.title"></h5>
            </a>
            <p class="card-text" v-html="truncate(getTextFromHtml(row.description, {wordwrap: 130, ignoreImage: true}), 200)"></p>
            <div class="author d-flex flex-row">
                <div class="author-logo">
                    <img class="card-img-top rounded" src="/images/logo.svg" :alt="row.title" />
                </div>
                <div class="author-info pl-2">
                    <p class="name mb-1">
                        {{row.author}}
                    </p>
                    <p class="time">
                        {{row.pubDate}}
                    </p>
                </div>
                
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center">
      <button type="button" class="btn btn-default see-all-trade mx-auto" >
        <a href="https://medium.com/@kyberteam" target="_blank">See All</a>
      </button>
    </div>

  </div>
</template>

<script>
import _ from "lodash";
import io from "socket.io-client";
import moment from "moment";
import BigNumber from "bignumber.js";
import htmlToText from 'html-to-text';
import AppRequest from "../../core/request/AppRequest";
import util from "../../core/helper/util";
import network from "../../../../../config/network";
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens;
import Chart from "chart.js";

const defaultChartOptions = {
  legend: {
    display: false
  },
  tooltips: {
    mode: "index",
    axis: "x",
    intersect: false
  }
};

export default {
  data() {
    return {
      posts: []
    };
  },

  methods: {
    refresh() {
      fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@kyberteam"
      )
        .then(response => response.json())
        .then(data => {
          if (data.status == "ok" && data.items && data.items.length) {
            this.posts = data.items.slice(0,9);
          }
        });
    },
    getTextFromHtml(htmlString){
      const textString = htmlToText.fromString(htmlString)
      const removedLink = textString.replace(/\[(.*?)\]/g, '')
      return removedLink
    },
    truncate(str, n){
        return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
    }
  },

  watch: {
    "$route.query"() {
      this.refresh();
    }
  },

  mounted() {
    this.refresh();
  }
};
</script>
<style scoped lang="css">
.chart-period-picker {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
