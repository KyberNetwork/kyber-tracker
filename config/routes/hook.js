const hooks = {};
hooks[process.env.ALARM_BOT_HOOK] = ['AlarmBotController.alarm'];
hooks[process.env.ALARM_BOT_TG_HOOK] = ['AlarmBotController.haveChat'];
hooks[process.env.TRACKER_BOT_TG_HOOK] = ['TrackerBotController.haveChat'];

hooks[process.env.INTERNAL_BOT_TG_HOOK] = ['InternalBotController.haveChat'];

module.exports = {
    GET: hooks,
    POST: hooks,
    PUT: {
      
    },
    DELETE: {
      
    }
  };