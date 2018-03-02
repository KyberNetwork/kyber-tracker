
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('volume_hour', function (t) {
      t.bigIncrements('id').primary().unsigned();
      t.bigint('timestamp').unique();
      t.bigint('value_eth');
      t.bigint('value_usd');

      t.bigint('created_at');
      t.bigint('updated_at');
      t.integer('created_by');
      t.integer('updated_by');
    })
  ]);
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTableIfExists('volume_hour');
}
