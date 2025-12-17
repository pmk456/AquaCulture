const db = require('../config/db');

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

  console.log('\n🔍 Running startup checks...\n');

  // 1. Check Database Connection
  try {
    await db.raw('SELECT 1');
    checks.database = true;
    console.log('✅ Database connection: OK');
  } catch (error) {
    console.error('❌ Database connection: FAILED');
    console.error(`   Error: ${error.message}`);
    console.error('   Make sure MySQL is running and credentials are correct.');
  }

  // 2. Check Environment Variables
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missingEnvVars.length === 0) {
    checks.env = true;
    console.log('✅ Environment variables: OK');
  } else {
    console.warn('⚠️  Environment variables: Some missing');
    console.warn(`   Missing: ${missingEnvVars.join(', ')}`);
    console.warn('   Using defaults from .env or knexfile.js');
  }

  // 3. Check Database Migrations
  if (checks.database) {
    try {
      const migrations = await db.migrate.list();
      const pending = migrations[1]; // Pending migrations
      
      if (pending && pending.length > 0) {
        console.warn(`⚠️  Database migrations: ${pending.length} pending`);
        console.warn('   Run: npm run migrate');
      } else {
        checks.migrations = true;
        console.log('✅ Database migrations: Up to date');
      }
    } catch (error) {
      console.error('❌ Database migrations check: FAILED');
      console.error(`   Error: ${error.message}`);
    }
  }

  // 4. Check Email Configuration
  if (process.env.SMTP_HOST) {
    try {
      // Just check if transporter can be created (doesn't send actual email)
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        } : undefined
      });
      
      // Verify connection (async, but we'll just check config)
      checks.email = true;
      console.log('✅ Email configuration: OK');
      console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
    } catch (error) {
      console.warn('⚠️  Email configuration: Invalid');
      console.warn(`   Error: ${error.message}`);
      console.warn('   Email features will be disabled.');
    }
  } else {
    console.warn('⚠️  Email configuration: Not configured');
    console.warn('   Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env');
    console.warn('   Email features will be disabled.');
  }

  // 5. Check if database has users
  if (checks.database) {
    try {
      const userCount = await db('users').count('* as count').first();
      const count = parseInt(userCount.count);
      
      if (count === 0) {
        console.warn('⚠️  Database: No users found');
        console.warn('   Run: npm run seed');
      } else {
        console.log(`✅ Database: ${count} user(s) found`);
      }
    } catch (error) {
      console.warn('⚠️  Could not check user count');
    }
  }

  // Summary
  console.log('\n📊 Startup Check Summary:');
  console.log(`   Database: ${checks.database ? '✅' : '❌'}`);
  console.log(`   Migrations: ${checks.migrations ? '✅' : '⚠️'}`);
  console.log(`   Email: ${checks.email ? '✅' : '⚠️'}`);
  console.log(`   Environment: ${checks.env ? '✅' : '⚠️'}`);

  if (!checks.database) {
    console.error('\n❌ CRITICAL: Database connection failed. Server may not work properly.\n');
    process.exit(1);
  }

  console.log('\n🚀 Server ready to start!\n');
  
  return checks;
}

module.exports = { runStartupChecks };

