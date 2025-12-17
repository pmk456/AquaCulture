exports.up = function(knex) {
  return knex.schema.createTable('sync_queue', function(table) {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('entity_type').notNullable(); // visit, dealer, etc.
    table.integer('entity_id').notNullable();
    table.string('operation').notNullable(); // create, update, delete
    table.json('data').notNullable(); // The data to sync
  table.enu('status', ['pending', 'syncing', 'completed', 'failed']).defaultTo('pending');
    table.integer('retry_count').defaultTo(0);
    table.text('error_message').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('synced_at').nullable();
    
    table.index('user_id');
    table.index('status');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sync_queue');
};

