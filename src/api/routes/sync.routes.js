const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');
const { requireApiAuth } = require('../../middleware/auth.middleware');

router.get('/pending', requireApiAuth, syncController.getPending);
router.get('/pending/count', requireApiAuth, syncController.getPendingCount);
router.post('/push', requireApiAuth, syncController.push);

module.exports = router;

