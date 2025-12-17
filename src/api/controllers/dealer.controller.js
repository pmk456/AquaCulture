const dealerService = require('../../services/dealer.service');
const { auditLog } = require('../../middleware/audit.middleware');

const DealerController = {
  async list(req, res, next) {
    try {
      const filters = {
        territory_id: req.query.territory_id,
        species: req.query.species,
        search: req.query.search
      };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await dealerService.paginate(filters, page, limit);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const dealer = await dealerService.findById(req.params.id);
      res.json({ dealer });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const dealer = await dealerService.create(req.body);
      
      await auditLog(req, 'create', 'dealer', dealer.id, { data: req.body });

      res.status(201).json({ dealer });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const dealer = await dealerService.update(req.params.id, req.body);
      
      await auditLog(req, 'update', 'dealer', dealer.id, { data: req.body });

      res.json({ dealer });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await dealerService.delete(req.params.id);
      
      await auditLog(req, 'delete', 'dealer', req.params.id);

      res.json({ message: 'Dealer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = DealerController;

