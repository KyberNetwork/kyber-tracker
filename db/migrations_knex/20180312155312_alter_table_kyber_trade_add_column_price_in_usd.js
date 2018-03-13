
exports.up = function(knex, Promise) {
  return knex.schema.table('kyber_trade', function (t) {
    t.decimal('taker_total_usd', 20, 10).after('day_seq').index();
    t.decimal('taker_price_usd', 20, 10).after('day_seq').index();
    t.decimal('maker_total_usd', 20, 10).after('day_seq').index();
    t.decimal('maker_price_usd', 20, 10).after('day_seq').index();
    t.decimal('taker_total_eth', 20, 10).after('day_seq').index();
    t.decimal('taker_price_eth', 20, 10).after('day_seq').index();
    t.decimal('maker_total_eth', 20, 10).after('day_seq').index();
    t.decimal('maker_price_eth', 20, 10).after('day_seq').index();
    t.decimal('taker_total_btc', 20, 10).after('day_seq').index();
    t.decimal('taker_price_btc', 20, 10).after('day_seq').index();
    t.decimal('maker_total_btc', 20, 10).after('day_seq').index();
    t.decimal('maker_price_btc', 20, 10).after('day_seq').index();
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
