
exports.up = function(knex, Promise) {
  return knex.schema.table('kyber_trade', function (t) {
    t.dropColumn('token_symbol');
    t.dropColumn('token_amount');
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
