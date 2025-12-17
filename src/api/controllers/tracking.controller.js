const trackingModel = require('../../models/tracking.model');
const { auditLog } = require('../../middleware/audit.middleware');

const TrackingController = {
  async ping(req, res, next) {
    try {
      const { latitude, longitude, accuracy, speed, heading } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const location = await trackingModel.create({
        user_id: req.user.id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        speed: speed ? parseFloat(speed) : null,
        heading: heading ? parseFloat(heading) : null
      });

      res.json({ location });
    } catch (error) {
      next(error);
    }
  },

  async getLocations(req, res, next) {
    try {
      const filters = {
        territory_id: req.query.territory_id,
        user_id: req.query.user_id,
        date: req.query.date
      };

      const locations = await trackingModel.getLatestLocations(filters);

      res.json({ locations });
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const history = await trackingModel.getUserHistory(req.user.id, limit);
      res.json({ history });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = TrackingController;

