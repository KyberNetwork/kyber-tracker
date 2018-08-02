module.exports = [{
  when: "*/10 * * * *",
  run: 'HistoryCacheRefresher'
}, {
  when: "*/10 * * * *",
  run: 'AllRateInfoCacheRefresher'
}, {
  when: "*/1 * * * *",
  run: 'VolumesCacheRefresher'
}, {
  when: "*/1 * * * *",
  run: 'Stats24hCacheRefresher'
},
  {
    when: "*/1 * * * *",
    run: 'TopTokenCacheRefresher'
  },
  {
    when: "*/1 * * * *",
    run: 'TradesListCacheRefresher'
  }];
