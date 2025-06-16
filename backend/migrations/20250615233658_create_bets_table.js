exports.up = function(knex) {
  return knex.schema.createTable('bets', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();
    table.string('description');
    table.float('amount_risked').notNullable();
    table.float('odds').notNullable();
    table.string('result').notNullable(); // e.g., 'win', 'loss', 'pending'
    table.float('payout').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bets');
};
