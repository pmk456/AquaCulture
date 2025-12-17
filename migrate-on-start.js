// This script runs Knex migrations automatically. Use in production to ensure DB is up-to-date.
const knex = require('knex')(require('./knexfile').development);

(async () => {
  try {
    await knex.migrate.latest();
    console.log('Database migrated successfully.');
    await knex.seed.run();
    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration/Seeding failed:', err);
    process.exit(1);
  }
})();
