const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const dealerRoutes = require('./dealer.routes');
const visitRoutes = require('./visit.routes');
const syncRoutes = require('./sync.routes');
const trackingRoutes = require('./tracking.routes');
const territoryRoutes = require('./territory.routes');

router.use('/auth', authRoutes);
router.use('/dealers', dealerRoutes);
router.use('/visits', visitRoutes);
router.use('/sync', syncRoutes);
router.use('/tracking', trackingRoutes);
router.use('/territories', territoryRoutes);

module.exports = router;

