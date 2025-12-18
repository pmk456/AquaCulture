require('dotenv').config();

module.exports = {
  development: {
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
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
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
      directory: './migrations'
    }
  }
};

