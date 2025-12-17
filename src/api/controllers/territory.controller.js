const territoryService = require('../../services/territory.service');
const userService = require('../../services/user.service');

const TerritoryController = {
  async getAssigned(req, res, next) {
    try {
      const user = await userService.findById(req.user.id);
      
      if (!user.territory_id) {
        return res.status(404).json({ error: 'No territory assigned' });
      }

      const territory = await territoryService.findById(user.territory_id);
      
      // Format for mobile app
      const polygon = territory.polygon_coordinates || [];
      
      res.json({
        territory_id: territory.id,
        id: territory.id,
        name: territory.name,
        polygon: polygon.map(p => ({
          lat: p.lat || p.latitude,
          lng: p.lng || p.longitude
        }))
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = TerritoryController;

