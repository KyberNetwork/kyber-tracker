
exports.up = function(knex, Promise) {
  return knex.schema.table('kyber_trade', function (t) {
    t.integer('minute_seq').after('reserve_address').index();
    t.integer('hour_seq').after('minute_seq').index();
    t.integer('day_seq').after('hour_seq').index();
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
