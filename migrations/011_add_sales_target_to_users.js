exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.decimal('sales_target', 10, 2).nullable().after('territory_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('sales_target');
  });
};

