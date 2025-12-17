exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
  table.enu('role', ['super_admin', 'manager', 'rep']).notNullable().defaultTo('rep');
    table.integer('territory_id').references('id').inTable('territories').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();
    table.timestamps(true, true);
    
    table.index('email');
    table.index('role');
    table.index('territory_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

