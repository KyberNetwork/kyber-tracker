
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('kyber_trade', function (t) {
      t.bigIncrements('id').primary().unsigned();
      t.integer('block_number').notNullable().index();
      t.string('block_hash', 100).notNullable().index();
      t.bigint('block_timestamp').notNullable().index();
      t.string('tx', 100).notNullable().unique();
      t.string('maker_address', 255).notNullable().index();
      t.string('maker_token_address', 255).notNullable().index();
      t.string('maker_token_symbol', 10).notNullable().index();
      t.string('maker_token_amount', 100).notNullable();
      t.string('taker_address', 255).notNullable().index();
      t.string('taker_token_address', 255).notNullable().index();
      t.string('taker_token_symbol', 10).notNullable().index();
      t.string('taker_token_amount', 100).notNullable();
      t.bigint('gas_limit').notNullable();
      t.bigint('gas_price').notNullable();
      t.bigint('gas_used').notNullable();
      t.string('maker_fee').notNullable().default('0');
      t.string('taker_fee').notNullable().default('0');
      t.string('burn_fees').notNullable();
      t.string('reserve_address').notNullable();

      t.bigint('created_at');
      t.bigint('updated_at');
      t.integer('created_by');
      t.integer('updated_by');
    })
  ]);
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTableIfExists('kyber_trade');
}
