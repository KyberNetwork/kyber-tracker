const RateLimit = require('express-rate-limit');

module.exports = () => {
    return new RateLimit({
      windowMs: 15*60*1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      delayMs: 0 // disable delaying - full speed until the max limit is reached
    });
};
