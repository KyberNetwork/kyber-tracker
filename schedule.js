require('dotenv').config();
const path = require('path');
const SotaCore = require('sota-core');
const schedule = require('node-schedule');
const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

const Jobs = require('./config/cache/lists');

Object.keys(Jobs).map((index) => {
  var job = Jobs[index];
  schedule.scheduleJob(job.when, () => {
    const jobClass = require(`./app/jobs/${job.run}`)
    const create_job = new jobClass()
    create_job.start({
      create_job: create_job,
      time: job.when
    });
  });
});

module.exports = app;
module.exports.SotaCore = SotaCore;
