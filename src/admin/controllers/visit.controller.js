const visitService = require('../../services/visit.service');
const dealerService = require('../../services/dealer.service');
const userService = require('../../services/user.service');
const { auditLog } = require('../../middleware/audit.middleware');
const territoryService = require('../../services/territory.service');
const whatsappService = require('../../services/whatsapp.service');
const trackingModel = require('../../models/tracking.model');

const VisitController = {
  async list(req, res, next) {
    try {
      const filters = {
        dealer_id: req.query.dealer_id,
        rep_id: req.query.rep_id,
        visit_type: req.query.visit_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const [visits, dealers, reps, latestLocations] = await Promise.all([
        visitService.findAll(filters),
        dealerService.findAll({}),
        userService.findAll({ role: 'rep', is_active: true }),
        trackingModel.getLatestLocations()
      ]);

      res.render('visits/index', {
        title: 'Visits',
        currentPage: 'visits',
        user: req.session.user,
        visits,
        dealers,
        reps,
        latestLocations,
        filters
      });
    } catch (error) {
      next(error);
    }
  },

  async showDetail(req, res, next) {
    try {
      const visit = await visitService.findById(req.params.id);
      if (!visit) {
        return res.status(404).render('error', {
          title: 'Not Found',
          message: 'Visit not found',
          user: req.session.user
        });
      }

      let territory = null;
      if (visit.rep_id) {
        try {
          const rep = await userService.findById(visit.rep_id);
          if (rep && rep.territory_id) {
            territory = await territoryService.findById(rep.territory_id);
          }
        } catch (error) {
          console.warn(`Could not fetch rep/territory info for visit ${visit.id}:`, error.message);
        }
      }

      let latestLocation = null;
      if (!visit.end_time && visit.rep_id) {
        const locations = await trackingModel.getLatestLocations({ user_id: visit.rep_id });
        if (locations && locations.length > 0) {
          latestLocation = locations[0];
        }
      }

      res.render('visits/detail', {
        title: 'Visit Details',
        currentPage: 'visits',
        user: req.session.user,
        visit,
        visitId: req.params.id,
        territory,
        latestLocation
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const visitId = req.params.id;
      const { status } = req.body;
      const validStatuses = ['pending', 'denied', 'hold', 'accepted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Get visit details before update
      const visit = await visitService.findById(visitId);
      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      const updateData = {
        status,
        manager_verified: status === 'accepted',
        sale_completed: status === 'accepted' // Mark as sale completed when accepted
      };

      await visitService.update(visitId, updateData);
      await auditLog(req, 'update', 'visit', visitId, { status });

      // Send WhatsApp notification to rep
      if (visit.rep_id) {
        try {
          if (status === 'accepted') {
            await whatsappService.sendSaleCompletionNotification(visit.rep_id, visit);
          } else {
            await whatsappService.sendVisitStatusNotification(visit.rep_id, status, visit);
          }
        } catch (whatsappError) {
          // Log error but don't fail the request
          console.error('WhatsApp notification error:', whatsappError);
        }
      }

      res.json({ success: true, status });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await visitService.delete(req.params.id);

      await auditLog(req, 'delete', 'visit', req.params.id);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = VisitController;

