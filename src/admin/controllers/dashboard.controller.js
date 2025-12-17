const dashboardService = require('../../services/dashboard.service');

const DashboardController = {
  async index(req, res, next) {
    try {
      const [stats, quickLinks, recentActivities, recentVisits, dailyActivity] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getQuickLinks(),
        dashboardService.getRecentActivities(10),
        dashboardService.getRecentVisits(10),
        dashboardService.getDailyActivity()
      ]);

      res.render('dashboard/index', {
        title: 'Dashboard',
        currentPage: 'dashboard',
        user: req.session.user,
        stats,
        quickLinks,
        recentActivities,
        recentVisits,
        dailyActivity
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = DashboardController;

