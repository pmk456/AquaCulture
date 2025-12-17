const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visit.controller');
const { requireApiAuth } = require('../../middleware/auth.middleware');
const { auditApiAction } = require('../../middleware/audit.middleware');
const { uploadPhotos } = require('../../utils/upload');

router.post('/start', requireApiAuth, auditApiAction('create', 'visit'), visitController.startVisit);
router.post('/:id/end', requireApiAuth, uploadPhotos, auditApiAction('update', 'visit'), visitController.endVisit);
router.post('/:id/photos', requireApiAuth, uploadPhotos, visitController.uploadPhotos);
router.get('/', requireApiAuth, visitController.list);
router.get('/:id', requireApiAuth, visitController.getById);

module.exports = router;

