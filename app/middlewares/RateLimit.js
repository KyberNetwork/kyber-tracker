const RateLimit = require('express-rate-limit');
const RedisStore = require('./RedisStore');
const configList = require('../../config/routes/ratelimit');
module.exports = () => {
  let list = [];
  for(let index in configList){
    let rateLimited = rateLimit(configList[index]);
    list.push(rateLimited);
  }
  if(list.length>0){
    return list
  }
  return ()=>{}
};

function rateLimit(options, delayMs = 0, expiry = 60, windowMs = 60 * 1000) {

  return new RateLimit({
    store: new RedisStore({expiry: options.expiry || expiry}),
    windowMs: options.windowMs || windowMs,
    max: options.max || 50,
    delayMs: options.delayMs || delayMs,
    message: "Too many request from your IP, please try again after an 1 minute",
    skip: (req, res) => {
      if(options.rest){
        if(!req.headers.referer && options.apis.indexOf(req._parsedOriginalUrl.pathname.toLowerCase()) !== -1){
          return false;
        }
      }else {
        if(req._parsedOriginalUrl.pathname.toLowerCase().indexOf(options.apis[0]) !== -1){
          return false;
        }
      }
      return true
    },
    handler: function (req, res, /*next*/) {
      if (req.headers) {
        res.setHeader('Retry-After', Math.ceil(req.windowMs / 1000));
      }
      res.format({
        html: function(){
          res.status(req.statusCode).end(req.message);
        },
        json: function(){
          res.status(req.statusCode).json({ message: req.message });
        }
      });
    }
  });
}

