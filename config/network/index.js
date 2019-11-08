const mainnetSettings = require('./production');
const stagingSettings = require('./staging');
const ropstenSettings = require('./ropsten');
const kovanSettings = require('./kovan');

module.exports = (function(chain) {
    try {
        const configData = require('./' + chain );
        return configData
    } catch (err) {
        if (err.code && err.code === 'MODULE_NOT_FOUND') {
            console.error('No config file matching ENV=' + chain);
            // process.exit(1);
          } else {
            throw err;
          }
    }
    // if (chain === "ropsten") return configPath;
    // if (chain === "staging") return stagingSettings;
    // if (chain === "kovan") return kovanSettings;
    // return mainnetSettings;
})(process.env.NODE_ENV || "production");