require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { runStartupChecks } = require('./src/utils/startup-checks');
const fs = require('fs');
const app = express();

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
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Globals
app.use((req, res, next) => {
  res.locals.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  next();
});

// Static
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api', require('./src/api/routes'));
app.use('/', require('./src/admin/routes'));

// Error middleware
app.use(require('./src/middleware/error.middleware'));

// 404
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

/* =======================
   START SERVER PROPERLY
   ======================= */

async function startServer() {
  try {
    const knex = require('knex')(require('./knexfile').development);

    await knex.migrate.latest();
    console.log('Database migrated successfully.');

    await runStartupChecks();

  } catch (err) {

      const log = `
        [${new Date().toISOString()}]
        Startup Error:
        ${err.stack || err}
        ${err.stack}
        ----------------------------------
        `;
        fs.appendFileSync(logFile, log, 'utf8');
  }
}


const logFile = path.join(__dirname, 'startuplog.log');

startServer();

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
