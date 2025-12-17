const auditModel = require('../../models/audit.model');
const userService = require('../../services/user.service');

const AuditController = {
  async list(req, res, next) {
    try {
      const filters = {
        user_id: req.query.user_id,
        entity_type: req.query.entity_type,
        action: req.query.action,
        start_date: req.query.from_date,
        end_date: req.query.to_date
      };

      const page = parseInt(req.query.page) || 1;
      const limit = 50;

      const result = await auditModel.paginate(filters, page, limit);
      const users = await userService.findAll();

      res.render('audit/index', {
        title: 'Audit Logs',
        currentPage: 'audit',
        user: req.session.user,
        logs: result.data,
        pagination: result.pagination,
        users,
        req: req
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuditController;

