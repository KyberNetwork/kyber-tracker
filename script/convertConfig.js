const network = require("../config/network")

const tokens = network.tokens

const outputConfig = {}

Object.values(tokens).map(t => {
  outputConfig[t.address.toLowerCase()] = {...t, address: t.address.toLowerCase()}
})


console.log(outputConfig)