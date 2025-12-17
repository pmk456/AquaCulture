exports.up = function(knex) {
  return knex.schema.table('visits', function(table) {
    table.enum('status', ['pending', 'denied', 'hold', 'accepted']).defaultTo('pending').after('end_time');
    table.boolean('manager_verified').defaultTo(false).after('status');
  });
};

exports.down = function(knex) {
  return knex.schema.table('visits', function(table) {
    table.dropColumn('status');
    table.dropColumn('manager_verified');
  });
};

