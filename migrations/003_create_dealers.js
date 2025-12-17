exports.up = function(knex) {
  return knex.schema.createTable('dealers', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('phone').nullable();
    table.string('email').nullable();
    table.text('address').notNullable();
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.decimal('farm_size', 10, 2).notNullable(); // in acres
    table.string('species').notNullable(); // tilapia, catfish, salmon, etc.
    table.integer('territory_id').references('id').inTable('territories').onDelete('SET NULL');
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    table.index('territory_id');
    table.index('species');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('dealers');
};

