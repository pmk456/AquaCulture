const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const dashboardController = require('../controllers/dashboard.controller');
const userController = require('../controllers/user.controller');
const dealerController = require('../controllers/dealer.controller');
const visitController = require('../controllers/visit.controller');
const territoryController = require('../controllers/territory.controller');
const mapController = require('../controllers/map.controller');
const auditController = require('../controllers/audit.controller');
const settingsController = require('../controllers/settings.controller');

const { requireAdminAuth, requireAdminRole } = require('../../middleware/auth.middleware');
const { auditAdminAction } = require('../../middleware/audit.middleware');

// Auth routes
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.post('/login/2fa', authController.verify2FA);
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/logout', authController.logout);

// Dashboard
router.get('/dashboard', requireAdminAuth, dashboardController.index);
router.get('/', requireAdminAuth, (req, res) => res.redirect('/dashboard'));

// Users
router.get('/users', requireAdminAuth, userController.list);
router.get('/users/new', requireAdminAuth, requireAdminRole('super_admin', 'manager'), userController.showCreate);
router.post('/users', requireAdminAuth, requireAdminRole('super_admin', 'manager'), auditAdminAction('create', 'user'), userController.create);
router.get('/users/:id/edit', requireAdminAuth, requireAdminRole('super_admin', 'manager'), userController.showEdit);
router.post('/users/:id', requireAdminAuth, requireAdminRole('super_admin', 'manager'), auditAdminAction('update', 'user'), userController.update);
router.post('/users/:id/deactivate', requireAdminAuth, requireAdminRole('super_admin', 'manager'), userController.deactivate);
router.delete('/users/:id', requireAdminAuth, requireAdminRole('super_admin', 'manager'), auditAdminAction('delete', 'user'), userController.delete);

// Dealers
router.get('/dealers', requireAdminAuth, dealerController.list);
router.get('/dealers/new', requireAdminAuth, dealerController.showCreate);
router.post('/dealers', requireAdminAuth, auditAdminAction('create', 'dealer'), dealerController.create);
router.get('/dealers/:id', requireAdminAuth, dealerController.showDetail);
router.get('/dealers/:id/edit', requireAdminAuth, dealerController.showEdit);
router.post('/dealers/:id', requireAdminAuth, auditAdminAction('update', 'dealer'), dealerController.update);
router.delete('/dealers/:id', requireAdminAuth, auditAdminAction('delete', 'dealer'), dealerController.delete);

// Visits
router.get('/visits', requireAdminAuth, visitController.list);
router.get('/visits/:id', requireAdminAuth, visitController.showDetail);
router.post('/visits/:id/status', requireAdminAuth, auditAdminAction('update', 'visit'), visitController.updateStatus);
router.delete('/visits/:id', requireAdminAuth, auditAdminAction('delete', 'visit'), visitController.delete);

// Territories - specific routes must come before :id routes
router.get('/territories', requireAdminAuth, territoryController.list);
router.get('/territories/new', requireAdminAuth, requireAdminRole('super_admin', 'manager'), territoryController.showCreate);
router.post('/territories', requireAdminAuth, requireAdminRole('super_admin', 'manager'), auditAdminAction('create', 'territory'), territoryController.create);
router.get('/territories/:id/edit', requireAdminAuth, requireAdminRole('super_admin', 'manager'), territoryController.showEdit);
router.get('/territories/:id', requireAdminAuth, territoryController.show);
router.post('/territories/:id', requireAdminAuth, requireAdminRole('super_admin', 'manager'), auditAdminAction('update', 'territory'), territoryController.update);
router.delete('/territories/:id', requireAdminAuth, requireAdminRole('super_admin', 'manager'), auditAdminAction('delete', 'territory'), territoryController.delete);

// Map
router.get('/map', requireAdminAuth, mapController.index);

// Audit
router.get('/audit', requireAdminAuth, auditController.list);

// Settings
router.get('/settings', requireAdminAuth, settingsController.index);
router.get('/settings/email-templates', requireAdminAuth, settingsController.emailTemplates);
router.get('/settings/tracking', requireAdminAuth, settingsController.tracking);
router.get('/settings/integrations', requireAdminAuth, settingsController.integrations);
router.get('/settings/privacy', requireAdminAuth, settingsController.privacy);

module.exports = router;

