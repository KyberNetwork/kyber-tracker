<template>
  <span><router-link :to="getLink()">{{ symbol }}</router-link></span>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../request/AppRequest';
import util from '../helper/util';
import network from '../../../../../config/network';

export default {
  props: {
    symbol: {
      type: String,
    },
  },
  data() {
    return {
      tokens: _.keyBy(_.values(network.tokens), 'symbol')
    };
  },
  methods: {
    getLink () {
      const tokenDef = this.tokens[this.symbol];
      if (!tokenDef) {
        return '';
      }

      return `/tokens/${tokenDef.address}`;
    }
  },
};
</script>
