
exports.up = function(knex, Promise) {
  return knex.schema.table('burned_fee', function (t) {
    t.string('burner_contract', 50).after('burner_address').notNullable().index();
    t.string('reserve_contract', 50).after('burner_contract').notNullable().index();
    t.string('reserve_wallet', 50).after('reserve_contract').notNullable().index();
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
