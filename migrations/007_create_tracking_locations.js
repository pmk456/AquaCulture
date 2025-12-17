exports.up = function(knex) {
  return knex.schema.createTable('tracking_locations', function(table) {
    table.increments('id').primary();
  table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.decimal('accuracy', 10, 2).nullable();
    table.decimal('speed', 10, 2).nullable();
    table.decimal('heading', 5, 2).nullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('timestamp');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tracking_locations');
};

