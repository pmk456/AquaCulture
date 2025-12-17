# AquaCulture CRM - Full Stack System

A comprehensive CRM system with both Admin Dashboard (EJS SSR) and Mobile App API (JSON), built with clean architecture principles.

## Architecture

```
src/
  api/                    # JSON APIs (for mobile app)
    routes/              # API route definitions
    controllers/         # API controllers (return JSON)
    validators/         # Request validation (future)

  admin/                 # Admin panel SSR routes
    routes/             # Admin route definitions
    controllers/        # Admin controllers (render EJS)

  services/             # Business logic (shared)
    user.service.js
    dealer.service.js
    visit.service.js
    territory.service.js
    sync.service.js
    dashboard.service.js

  models/               # Database layer (Knex queries)
    user.model.js
    dealer.model.js
    visit.model.js
    territory.model.js
    audit.model.js
    sync.model.js
    tracking.model.js

  config/               # Configuration
    db.js              # Knex database connection

  middleware/           # Express middleware
    auth.middleware.js  # Session (admin) + JWT (API)
    audit.middleware.js # Audit logging
    error.middleware.js # Error handling

  utils/               # Utilities
    errors.js          # Custom error classes
    logger.js          # Audit logging helper

  views/               # EJS templates (admin panel)
  public/             # Static files (CSS, JS, images)
```

## Key Features

### ✅ Clean Architecture
- **Models**: Database queries (Knex)
- **Services**: Business logic (shared by admin + API)
- **Controllers**: Request handling (separate for admin/API)
- **Routes**: Route definitions

### ✅ Dual Interface
- **Admin Dashboard**: EJS server-side rendering (sessions)
- **Mobile API**: JSON REST API (JWT tokens)

### ✅ PostgreSQL Database
- Full database schema with migrations
- All mock data removed
- Real queries for all operations

### ✅ Authentication
- **Admin**: Session-based authentication
- **API**: JWT token-based authentication

### ✅ Audit Logging
- Every action logged to database
- Tracks: user, action, entity, timestamp, IP

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE aquaculture_crm;
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=aquaculture_crm

SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

### 4. Run Migrations

```bash
npm run migrate
```

This creates all database tables.

### 5. Seed Initial Data (Optional)

```bash
npm run seed
```

Creates sample users, territories, dealers, and visits.

**Default Login:**
- Email: `admin@aquaculture.com`
- Password: `password123`

### 6. Start Server

```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get current user

### Dealers
- `GET /api/dealers` - List dealers (with filters)
- `GET /api/dealers/:id` - Get dealer details
- `POST /api/dealers` - Create dealer
- `PUT /api/dealers/:id` - Update dealer
- `DELETE /api/dealers/:id` - Delete dealer

### Visits
- `POST /api/visits/start` - Start a visit
- `POST /api/visits/:id/end` - End a visit
- `GET /api/visits` - List visits (with filters)
- `GET /api/visits/:id` - Get visit details

### Sync (Offline-first)
- `GET /api/sync/pending` - Get pending sync items
- `GET /api/sync/pending/count` - Get count of pending items
- `POST /api/sync/push` - Push synced data

### Tracking
- `POST /api/tracking/ping` - Send location ping
- `GET /api/tracking/locations` - Get latest locations
- `GET /api/tracking/history` - Get location history

## Admin Routes

All admin routes require authentication (session):

- `/login` - Login page
- `/dashboard` - Main dashboard
- `/users` - User management
- `/dealers` - Dealer management
- `/visits` - Visit management
- `/territories` - Territory management
- `/map` - Live map view
- `/audit` - Audit logs
- `/settings` - Settings pages

## Database Schema

### Tables
- `users` - System users (admin, manager, rep)
- `territories` - Sales territories
- `dealers` - Dealer/farm information
- `visits` - Sales rep visits
- `audit_logs` - System audit trail
- `sync_queue` - Offline sync queue
- `tracking_locations` - Location tracking data

## Development

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

### Database Queries

All database queries use Knex. Models are in `src/models/`.

Example:
```javascript
const userModel = require('./src/models/user.model');
const users = await userModel.findAll({ role: 'rep' });
```

### Services

Services contain business logic and use models:

```javascript
const userService = require('./src/services/user.service');
const user = await userService.create({ email, password, ... });
```

### Adding New Features

1. **Create Migration**: `migrations/XXX_create_table.js`
2. **Create Model**: `src/models/entity.model.js`
3. **Create Service**: `src/services/entity.service.js`
4. **Create Controllers**: 
   - `src/admin/controllers/entity.controller.js` (EJS)
   - `src/api/controllers/entity.controller.js` (JSON)
5. **Create Routes**: Add to route files
6. **Create Views**: `src/views/entity/` (for admin)

## Testing API

### Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aquaculture.com","password":"password123"}'
```

### Use Token

```bash
curl http://localhost:3000/api/dealers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use secure session secret and JWT secret
3. Enable SSL for database if needed
4. Set secure cookies in session config
5. Use environment variables for all secrets

## License

ISC
