exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', function(table) {
    table.increments('id').primary();
  table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.string('action').notNullable(); // create, update, delete, login, etc.
    table.string('entity_type').notNullable(); // user, dealer, visit, territory, etc.
    table.integer('entity_id').nullable();
    table.json('changes').nullable(); // Store before/after values
    table.string('ip_address').nullable();
    table.text('details').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('entity_type');
    table.index('entity_id');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('audit_logs');
};

