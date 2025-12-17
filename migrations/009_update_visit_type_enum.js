exports.up = function(knex) {
  // MySQL: alter the ENUM column to add 'field' value
  return knex.schema.alterTable('visits', function(table) {
    table.enu('visit_type', ['demo', 'sale', 'inspect', 'field']).notNullable().alter();
  });
};

exports.down = function(knex) {
  // MySQL: revert ENUM column to previous values
  return knex.schema.alterTable('visits', function(table) {
    table.enu('visit_type', ['demo', 'sale', 'inspect']).notNullable().alter();
  });
};

