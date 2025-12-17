const knex = require('knex');
const path = require('path');

const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 4444,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'AQUACULTURE',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: path.join(__dirname, '../../migrations')
  },
  seeds: {
    directory: path.join(__dirname, '../../seeds')
  }
};

const db = knex(config);

module.exports = db;

