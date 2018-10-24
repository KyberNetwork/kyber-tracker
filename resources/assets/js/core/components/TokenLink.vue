<template>
  <span @click.stop="onClickToken()">{{ symbol }}</span>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../request/AppRequest';
import util from '../helper/util';
// import network from '../../../../../config/network';
const GLOBAL_TOKENS = window["GLOBAL_STATE"].tokens
export default {
  props: {
    symbol: {
      type: String,
    },
  },
  data() {
    return {
      tokens: _.keyBy(_.values(GLOBAL_TOKENS), 'symbol')
    };
  },
  methods: {
    getLink () {
      const tokenDef = this.tokens[this.symbol];
      if (!tokenDef) {
        return '';
      }

      return `/tokens/${tokenDef.address}`;
    },
    onClickToken () {
      const tokenDef = this.tokens[this.symbol];
      if (!tokenDef) {
        return;
      }

      this.$router.replace({
        name: 'token-details',
        params: {
          tokenAddr: tokenDef.address
        }
      });
    },
  },
};
</script>
