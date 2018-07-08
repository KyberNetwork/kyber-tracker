const network = require('../../config/network');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(network.endpoints.web3Provider));
const formatters = require('web3-core-helpers').formatters;

web3.extend({
  methods: [{
    name: 'getLogs',
    call: 'eth_getLogs',
    params: 1,
    inputFormatter: [formatters.inputLogFormatter],
    outputFormatter: formatters.outputLogFormatter
  }]
});

module.exports = () => {
  return web3;
};
