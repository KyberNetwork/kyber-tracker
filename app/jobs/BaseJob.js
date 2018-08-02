const _               = require('lodash');
const async           = require('async');
const logger          = require('sota-core').getLogger('BaseJob');

class BaseJob {
  start(options) {
    async.auto({
      process: (next) => {
        this.executeJob(next);
      },
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(`Finish Create Cache ${options.create_job.constructor.name}...`);
      }
      logger.info(`Create Cache ${options.create_job.constructor.name} will be restart in ${options.time}`);
    });
  };
  executeJob() {throw new Error('Implement me.');};
}
module.exports = BaseJob;