const visitService = require('../../services/visit.service');
const syncService = require('../../services/sync.service');
const { auditLog } = require('../../middleware/audit.middleware');
const { getPhotoUrls } = require('../../utils/upload');
const path = require('path');

const VisitController = {
  async startVisit(req, res, next) {
    try {
      const visitData = {
        ...req.body,
        rep_id: req.user.id
      };

      const visit = await visitService.startVisit(visitData);
      
      // Create sync queue entry for offline-first
      await syncService.createPendingSync(
        req.user.id,
        'visit',
        visit.id,
        'create',
        visit
      );

      await auditLog(req, 'create', 'visit', visit.id);

      res.status(201).json({ visit });
    } catch (error) {
      next(error);
    }
  },

  async endVisit(req, res, next) {
    try {
      const visitId = parseInt(req.params.id, 10);
      if (isNaN(visitId)) {
        return res.status(400).json({ error: 'Invalid visit ID' });
      }

      // Extract form data
      const visitData = {
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
        notes: req.body.notes || undefined,
        status: req.body.status || 'pending', // Default to pending if not provided
      };

      // Handle uploaded photos
      if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const photoUrls = req.files.map(file => {
          const relativePath = `/uploads/visits/${visitId}/${path.basename(file.path)}`;
          return `${baseUrl}${relativePath}`;
        });
        visitData.photos = photoUrls;
      }

      const visit = await visitService.endVisit(visitId, visitData);
      
      // Update sync queue
      await syncService.createPendingSync(
        req.user.id,
        'visit',
        visit.id,
        'update',
        visit
      );

      await auditLog(req, 'update', 'visit', visit.id);

      res.json({ visit });
    } catch (error) {
      next(error);
    }
  },

  async uploadPhotos(req, res, next) {
    try {
      const visitId = parseInt(req.params.id, 10);
      if (isNaN(visitId)) {
        return res.status(400).json({ error: 'Invalid visit ID' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No photos uploaded' });
      }

      // Get existing visit
      const visit = await visitService.findById(visitId);
      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      // Generate photo URLs
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const newPhotoUrls = req.files.map(file => {
        const relativePath = `/uploads/visits/${visitId}/${path.basename(file.path)}`;
        return `${baseUrl}${relativePath}`;
      });

      // Merge with existing photos
      const existingPhotos = visit.photos || [];
      const allPhotos = [...existingPhotos, ...newPhotoUrls];

      // Update visit with new photos
      await visitService.update(visitId, { photos: allPhotos });

      const updatedVisit = await visitService.findById(visitId);

      res.json({ visit: updatedVisit, photos: newPhotoUrls });
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const filters = {
        dealer_id: req.query.dealer_id,
        rep_id: req.query.rep_id || req.user.id, // Default to current user
        visit_type: req.query.visit_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await visitService.paginate(filters, page, limit);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const visit = await visitService.findById(req.params.id);
      res.json({ visit });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = VisitController;

