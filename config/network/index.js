const mainnetSettings = require('./production');
const stagingSettings = require('./staging');
const ropstenSettings = require('./ropsten');
const kovanSettings = require('./kovan');

module.exports = (function(chain) {
    if (chain === "ropsten") return ropstenSettings;
    if (chain === "staging") return stagingSettings;
    if (chain === "kovan") return kovanSettings;
    return mainnetSettings;
})(process.env.NODE_ENV || "production");