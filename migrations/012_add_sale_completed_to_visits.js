exports.up = function(knex) {
  return knex.schema.table('visits', function(table) {
    table.boolean('sale_completed').defaultTo(false).after('manager_verified');
  });
};

exports.down = function(knex) {
  return knex.schema.table('visits', function(table) {
    table.dropColumn('sale_completed');
  });
};

