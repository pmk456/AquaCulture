const knex = require('knex');
const path = require('path');

const config = {
  client: 'mysql2',
  connection: {
      
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'u651765855_prutto',
      password: process.env.DB_PASSWORD || 'Prutto@123',
      database: process.env.DB_NAME || 'u651765855_AQUACULTURE'
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

