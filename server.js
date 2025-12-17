require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { runStartupChecks } = require('./src/utils/startup-checks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'aquaculture-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Make Google Maps API key available to all views
app.use((req, res, next) => {
  res.locals.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes (JSON responses)
const apiRoutes = require('./src/api/routes');
app.use('/api', apiRoutes);

// Admin Routes (EJS SSR)
const adminRoutes = require('./src/admin/routes');
app.use('/', adminRoutes);

// Error handling middleware (must be last)
const errorHandler = require('./src/middleware/error.middleware');
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(404).render('error', {
    title: 'Not Found',
    message: 'Page not found',
    user: req.session?.user
  });
});

// Run startup checks before starting server

const knex = require('knex')(require('./knexfile').development);


await knex.migrate.latest();
console.log('Database migrated successfully.');
await runStartupChecks();
try {
    app.listen(PORT, () => {
        console.log(`\nServer running on http://localhost:${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
        console.log(`Admin panel at http://localhost:${PORT}/dashboard\n`);
    });
} catch (error) {
  console.error('\nFailed to start server:', error.message);
  process.exit(1);
}
