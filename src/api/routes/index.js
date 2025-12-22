const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const dealerRoutes = require('./dealer.routes');
const visitRoutes = require('./visit.routes');
const syncRoutes = require('./sync.routes');
const trackingRoutes = require('./tracking.routes');
const territoryRoutes = require('./territory.routes');


router.get("/health", (req, res) => {
    return res.status(200).json({"health": "working"});
});


router.use('/auth', authRoutes);
router.use('/dealers', dealerRoutes);
router.use('/visits', visitRoutes);
router.use('/sync', syncRoutes);
router.use('/tracking', trackingRoutes);
router.use('/territories', territoryRoutes);

module.exports = router;

