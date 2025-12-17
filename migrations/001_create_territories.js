exports.up = function(knex) {
  return knex.schema.createTable('territories', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description').nullable();
    table.json('polygon_coordinates').nullable(); // For future map shape support
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('name');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('territories');
};

