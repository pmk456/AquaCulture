const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const logFile = path.join(__dirname, '../checks.log');


// Clear file on every startup
fs.writeFileSync(logFile, '');

// Simple logger
function log(message) {
  fs.appendFileSync(logFile, message + '\n');
}

/**
 * Run startup validation checks
 */
async function runStartupChecks() {
  
  const checks = {
    database: false,
    email: false,
    migrations: false,
    env: false
  };

  log('\nRunning startup checks...\n');

  // 1. Check Database Connection
  try {
    await db.raw('SELECT 1');
    checks.database = true;
    log('Database connection: OK');
  } catch (error) {
    log('Database connection: FAILED');
    log(`   Error: ${error.message}`);
    log('   Make sure MySQL is running and credentials are correct.');
  }

  // 2. Check Environment Variables
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missingEnvVars.length === 0) {
    checks.env = true;
    log('Environment variables: OK');
  } else {
    log('Environment variables: Some missing');
    log(`   Missing: ${missingEnvVars.join(', ')}`);
    log('   Using defaults from .env or knexfile.js');
  }

  // 3. Check Database Migrations
  if (checks.database) {
    try {
      const migrations = await db.migrate.list();
      const pending = migrations[1];
      
      if (pending && pending.length > 0) {
        log(`Database migrations: ${pending.length} pending`);
        log('   Run: npm run migrate');
      } else {
        checks.migrations = true;
        log('Database migrations: Up to date');
      }
    } catch (error) {
      log('Database migrations check: FAILED');
      log(`   Error: ${error.message}`);
    }
  }

  // 4. Check Email Configuration
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = require('nodemailer');
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        } : undefined
      });

      checks.email = true;
      log('Email configuration: OK');
      log(`   SMTP Host: ${process.env.SMTP_HOST}`);
    } catch (error) {
      log('Email configuration: Invalid');
      log(`   Error: ${error.message}`);
      log('   Email features will be disabled.');
    }
  } else {
    log('Email configuration: Not configured');
    log('   Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env');
    log('   Email features will be disabled.');
  }

  // 5. Check if database has users
  if (checks.database) {
    try {
      const userCount = await db('users').count('* as count').first();
      const count = parseInt(userCount.count);
      
      if (count === 0) {
        log('Database: No users found');
        log('   Run: npm run seed');
      } else {
        log(`Database: ${count} user(s) found`);
      }
    } catch (error) {
      log('Could not check user count');
    }
  }

  // Summary
  log('\nStartup Check Summary:');
  log(`   Database: ${checks.database ? 'OK' : 'FAILED'}`);
  log(`   Migrations: ${checks.migrations ? 'OK' : 'PENDING'}`);
  log(`   Email: ${checks.email ? 'OK' : 'NOT READY'}`);
  log(`   Environment: ${checks.env ? 'OK' : 'ISSUES'}`);

  if (!checks.database) {
    log('\nCRITICAL: Database connection failed. Server may not work properly.\n');
    process.exit(1);
  }

  log('\nServer ready to start!\n');
  
  return checks;
}

module.exports = { runStartupChecks };
