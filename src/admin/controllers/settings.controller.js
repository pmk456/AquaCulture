const userService = require('../../services/user.service');

const SettingsController = {
  async index(req, res) {
    res.render('settings/index', {
      title: 'Settings',
      currentPage: 'settings',
      user: req.session.user
    });
  },

  async emailTemplates(req, res) {
    res.render('settings/email-templates', {
      title: 'Email Templates',
      currentPage: 'settings',
      user: req.session.user
    });
  },

  async tracking(req, res) {
    try {
      const users = await userService.findAll({ is_active: true });
      res.render('settings/tracking', {
        title: 'Tracking Settings',
        currentPage: 'settings',
        user: req.session.user,
        users
      });
    } catch (error) {
      res.render('settings/tracking', {
        title: 'Tracking Settings',
        currentPage: 'settings',
        user: req.session.user,
        users: []
      });
    }
  },

  async integrations(req, res) {
    res.render('settings/integrations', {
      title: 'Integrations',
      currentPage: 'settings',
      user: req.session.user
    });
  },

  async privacy(req, res) {
    res.render('settings/privacy', {
      title: 'Privacy Policy',
      currentPage: 'settings',
      user: req.session.user
    });
  }
};

module.exports = SettingsController;

