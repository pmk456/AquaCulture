const trackingModel = require('../../models/tracking.model');
const userService = require('../../services/user.service');
const territoryService = require('../../services/territory.service');

const MapController = {
  async index(req, res, next) {
    try {
      const filters = {
        territory_id: req.query.territory_id,
        user_id: req.query.rep_id,
        date: req.query.date
      };

      const [locations, territories, reps] = await Promise.all([
        trackingModel.getLatestLocations(filters),
        territoryService.findAll({ is_active: true }),
        userService.findAll({ role: 'rep', is_active: true })
      ]);

      res.render('map/index', {
        title: 'Live Map',
        currentPage: 'map',
        user: req.session.user,
        locations,
        territories,
        reps,
        req: req
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = MapController;

