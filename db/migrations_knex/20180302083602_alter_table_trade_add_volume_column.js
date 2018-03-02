
exports.up = function(knex, Promise) {
  return knex.schema.table('kyber_trade', function (t) {
    t.string('volume_eth', 50).after('day_seq');
    t.string('volume_usd', 50).after('volume_eth');
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
