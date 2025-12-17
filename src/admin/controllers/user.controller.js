const userService = require('../../services/user.service');
const territoryService = require('../../services/territory.service');
const { auditLog } = require('../../middleware/audit.middleware');

const UserController = {
  async list(req, res, next) {
    try {
      const filters = {
        role: req.query.role,
        is_active: req.query.status === 'active' ? true : req.query.status === 'inactive' ? false : undefined,
        territory_id: req.query.territory_id,
        search: req.query.search
      };

      const users = await userService.findAll(filters);

      res.render('users/index', {
        title: 'Users',
        currentPage: 'users',
        user: req.session.user,
        users
      });
    } catch (error) {
      next(error);
    }
  },

  async showCreate(req, res, next) {
    try {
      const territories = await territoryService.findAll({ is_active: true });

      res.render('users/new', {
        title: 'Create User',
        currentPage: 'users',
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
      const newUser = await userService.create(req.body);
      
      await auditLog(req, 'create', 'user', newUser.id, { data: req.body });

      res.redirect('/users');
    } catch (error) {
      const territories = await territoryService.findAll({ is_active: true });
      res.render('users/new', {
        title: 'Create User',
        currentPage: 'users',
        user: req.session.user,
        territories,
        error: error.message,
        formData: req.body
      });
    }
  },

  async showEdit(req, res, next) {
    try {
      const [user, territories] = await Promise.all([
        userService.findById(req.params.id),
        territoryService.findAll({ is_active: true })
      ]);

      res.render('users/edit', {
        title: 'Edit User',
        currentPage: 'users',
        user: req.session.user,
        editUser: user,
        userId: req.params.id,
        territories
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      await userService.update(req.params.id, req.body);
      
      await auditLog(req, 'update', 'user', req.params.id, { data: req.body });

      res.redirect('/users');
    } catch (error) {
      const [editUser, territories] = await Promise.all([
        userService.findById(req.params.id),
        territoryService.findAll({ is_active: true })
      ]);

      res.render('users/edit', {
        title: 'Edit User',
        currentPage: 'users',
        user: req.session.user,
        editUser,
        userId: req.params.id,
        territories,
        error: error.message
      });
    }
  },

  async deactivate(req, res, next) {
    try {
      await userService.deactivate(req.params.id);
      
      await auditLog(req, 'deactivate', 'user', req.params.id);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);
      
      await auditLog(req, 'delete', 'user', req.params.id);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = UserController;

