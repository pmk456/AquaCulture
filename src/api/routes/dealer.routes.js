const express = require('express');
const router = express.Router();
const dealerController = require('../controllers/dealer.controller');
const { requireApiAuth } = require('../../middleware/auth.middleware');
const { auditApiAction } = require('../../middleware/audit.middleware');

router.get('/', requireApiAuth, dealerController.list);
router.get('/:id', requireApiAuth, dealerController.getById);
router.post('/', requireApiAuth, auditApiAction('create', 'dealer'), dealerController.create);
router.put('/:id', requireApiAuth, auditApiAction('update', 'dealer'), dealerController.update);
router.delete('/:id', requireApiAuth, auditApiAction('delete', 'dealer'), dealerController.delete);

module.exports = router;

