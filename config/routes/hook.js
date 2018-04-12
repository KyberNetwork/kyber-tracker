const hooks = {};
hooks[process.env.ALARM_BOT_HOOK] = ['HookController.alarm'];
hooks[process.env.ALARM_BOT_TG_HOOK] = ['HookController.haveChat'];

module.exports = {
    GET: hooks,
    POST: hooks,
    PUT: {
      
    },
    DELETE: {
      
    }
  };