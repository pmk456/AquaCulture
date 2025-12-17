const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const { requireApiAuth } = require('../../middleware/auth.middleware');

router.post('/ping', requireApiAuth, trackingController.ping);
router.get('/locations', requireApiAuth, trackingController.getLocations);
router.get('/history', requireApiAuth, trackingController.getHistory);

module.exports = router;

