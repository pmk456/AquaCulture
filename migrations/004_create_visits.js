exports.up = function(knex) {
  return knex.schema.createTable('visits', function(table) {
    table.increments('id').primary();
  table.integer('dealer_id').unsigned().references('id').inTable('dealers').onDelete('CASCADE');
  table.integer('rep_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
  table.enu('visit_type', ['demo', 'sale', 'inspect']).notNullable();
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').nullable();
    table.decimal('start_latitude', 10, 8).nullable();
    table.decimal('start_longitude', 11, 8).nullable();
    table.decimal('end_latitude', 10, 8).nullable();
    table.decimal('end_longitude', 11, 8).nullable();
    table.text('notes').nullable();
    table.json('photos').nullable(); // Array of photo URLs/paths
    table.boolean('is_synced').defaultTo(false);
    table.timestamps(true, true);
    
    table.index('dealer_id');
    table.index('rep_id');
    table.index('start_time');
    table.index('visit_type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('visits');
};

