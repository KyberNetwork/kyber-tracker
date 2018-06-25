const mainnetSettings = require('./production');
const ropstenSettings = require('./ropsten');

module.exports = (function(chain) {
    return (chain === "production") ? mainnetSettings : ropstenSettings;
})(process.env.NODE_ENV || "production");