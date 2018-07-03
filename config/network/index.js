const mainnetSettings = require('./production');
const stagingSettings = require('./staging');
const ropstenSettings = require('./ropsten');

module.exports = (function(chain) {
    if (chain === "ropsten") return ropstenSettings;
    if (chain === "staging") return stagingSettings;
    return mainnetSettings;
})(process.env.NODE_ENV || "production");