const dealerService = require('../../services/dealer.service');
const territoryService = require('../../services/territory.service');
const visitService = require('../../services/visit.service');
const { auditLog } = require('../../middleware/audit.middleware');

const DealerController = {
  async list(req, res, next) {
    try {
      const filters = {
        territory_id: req.query.territory_id,
        species: req.query.species,
        search: req.query.search
      };

      const [dealers, territories] = await Promise.all([
        dealerService.findAll(filters),
        territoryService.findAll({ is_active: true })
      ]);

      const speciesOptions = [...new Set(dealers.map(d => d.species).filter(Boolean))];

      res.render('dealers/index', {
        title: 'Dealers',
        currentPage: 'dealers',
        user: req.session.user,
        dealers,
        territories,
        speciesOptions,
        filters
      });
    } catch (error) {
      next(error);
    }
  },

  async showCreate(req, res, next) {
    try {
      const territories = await territoryService.findAll({ is_active: true });

      res.render('dealers/new', {
        title: 'Add Dealer',
        currentPage: 'dealers',
        user: req.session.user,
        territories,
        formData: {},
        error: null
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const dealer = await dealerService.create(req.body);
      
      await auditLog(req, 'create', 'dealer', dealer.id, { data: req.body });

      res.redirect('/dealers');
    } catch (error) {
      const territories = await territoryService.findAll({ is_active: true });
      res.render('dealers/new', {
        title: 'Add Dealer',
        currentPage: 'dealers',
        user: req.session.user,
        territories,
        error: error.message,
        formData: req.body
      });
    }
  },

  async showDetail(req, res, next) {
    try {
      const dealer = await dealerService.findById(req.params.id);
      const recentVisits = await visitService.findAll({ dealer_id: req.params.id, limit: 5 });

      // Load the dealer's territory (for polygon on the map) if available
      let territory = null;
      if (dealer.territory_id) {
        const territoryService = require('../../services/territory.service');
        territory = await territoryService.findById(dealer.territory_id);
      }

      res.render('dealers/detail', {
        title: 'Dealer Details',
        currentPage: 'dealers',
        user: req.session.user,
        dealer,
        dealerId: req.params.id,
        territory,
        recentVisits: recentVisits.slice(0, 5)
      });
    } catch (error) {
      next(error);
    }
  },

  async showEdit(req, res, next) {
    try {
      const [dealer, territories] = await Promise.all([
        dealerService.findById(req.params.id),
        territoryService.findAll({ is_active: true })
      ]);

      res.render('dealers/edit', {
        title: 'Edit Dealer',
        currentPage: 'dealers',
        user: req.session.user,
        dealer,
        dealerId: req.params.id,
        territories
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      await dealerService.update(req.params.id, req.body);
      
      await auditLog(req, 'update', 'dealer', req.params.id, { data: req.body });

      res.redirect(`/dealers/${req.params.id}`);
    } catch (error) {
      const [dealer, territories] = await Promise.all([
        dealerService.findById(req.params.id),
        territoryService.findAll({ is_active: true })
      ]);

      res.render('dealers/edit', {
        title: 'Edit Dealer',
        currentPage: 'dealers',
        user: req.session.user,
        dealer,
        dealerId: req.params.id,
        territories,
        error: error.message
      });
    }
  },

  async delete(req, res, next) {
    try {
      await dealerService.delete(req.params.id);
      
      await auditLog(req, 'delete', 'dealer', req.params.id);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = DealerController;

