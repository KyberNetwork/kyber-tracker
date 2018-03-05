
exports.up = function(knex, Promise) {
  return knex.schema.table('kyber_trade', function (t) {
    t.string('token_amount', 50).after('token_symbol').index();
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
