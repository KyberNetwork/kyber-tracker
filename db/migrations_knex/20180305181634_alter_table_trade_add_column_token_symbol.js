
exports.up = function(knex, Promise) {
  return knex.schema.table('kyber_trade', function (t) {
    t.string('token_symbol', 50).after('volume_usd').index();
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
