const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireApiAuth } = require('../../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/refresh', requireApiAuth, authController.refresh);
router.get('/profile', requireApiAuth, authController.getProfile);

module.exports = router;

