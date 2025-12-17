const express = require('express');
const router = express.Router();
const territoryController = require('../controllers/territory.controller');
const { requireApiAuth } = require('../../middleware/auth.middleware');

router.get('/assigned', requireApiAuth, territoryController.getAssigned);

module.exports = router;

