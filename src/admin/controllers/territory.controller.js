const territoryService = require('../../services/territory.service');
const { auditLog } = require('../../middleware/audit.middleware');

const TerritoryController = {
  async list(req, res, next) {
    try {
      const territories = await territoryService.findAll({ is_active: true });

      res.render('territories/index', {
        title: 'Territories',
        currentPage: 'territories',
        user: req.session.user,
        territories
      });
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const territory = await territoryService.findById(req.params.id);

      res.render('territories/show', {
        title: `${territory.name} - Territory`,
        currentPage: 'territories',
        user: req.session.user,
        territory
      });
    } catch (error) {
      next(error);
    }
  },

  async showCreate(req, res, next) {
    try {
      // Always provide default formData and error so the EJS template
      // can safely reference them without throwing ReferenceError
      res.render('territories/new', {
        title: 'Add Territory',
        currentPage: 'territories',
        user: req.session.user,
        error: null,
        formData: {}
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const territory = await territoryService.create(req.body);
      
      await auditLog(req, 'create', 'territory', territory.id, { data: req.body });

      res.redirect('/territories');
    } catch (error) {
      res.render('territories/new', {
        title: 'Add Territory',
        currentPage: 'territories',
        user: req.session.user,
        error: error.message,
        formData: req.body
      });
    }
  },

  async showEdit(req, res, next) {
    try {
      const territory = await territoryService.findById(req.params.id);

      res.render('territories/edit', {
        title: 'Edit Territory',
        currentPage: 'territories',
        user: req.session.user,
        territory,
        territoryId: req.params.id
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      await territoryService.update(req.params.id, req.body);
      
      await auditLog(req, 'update', 'territory', req.params.id, { data: req.body });

      res.redirect('/territories');
    } catch (error) {
      const territory = await territoryService.findById(req.params.id);

      res.render('territories/edit', {
        title: 'Edit Territory',
        currentPage: 'territories',
        user: req.session.user,
        territory,
        territoryId: req.params.id,
        error: error.message
      });
    }
  },

  async delete(req, res, next) {
    try {
      await territoryService.delete(req.params.id);
      
      await auditLog(req, 'delete', 'territory', req.params.id);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = TerritoryController;

