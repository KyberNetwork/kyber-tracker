
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('user', function (t) {
      t.bigIncrements('id').primary().unsigned();
      t.string('username', 40).notNullable().unique();
      t.string('avatar_url', 256);
      t.string('email', 40).notNullable().unique();
      t.string('password', 128);
      t.string('full_name', 45).notNullable().index();
      t.bigint('created_at');
      t.bigint('updated_at');
      t.integer('created_by');
      t.integer('updated_by');
      t.charset('utf8mb4');
      t.collate('utf8mb4_general_ci');
    })
  ]);
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTableIfExists('user');
}
