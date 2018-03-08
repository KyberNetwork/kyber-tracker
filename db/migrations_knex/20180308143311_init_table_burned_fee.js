
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('burned_fee', function (t) {
      t.bigIncrements('id').primary().unsigned();
      t.integer('block_number').notNullable().index();
      t.string('block_hash', 100).notNullable().index();
      t.bigint('block_timestamp').notNullable().index();
      t.string('tx', 100).notNullable().unique();
      t.string('burner_address', 50).notNullable().index();
      t.string('amount');

      t.bigint('created_at');
      t.bigint('updated_at');
      t.integer('created_by');
      t.integer('updated_by');
    })
  ]);
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTableIfExists('burned_fee');
}
