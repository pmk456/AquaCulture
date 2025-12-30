const userModel = require('../models/user.model');
const dealerModel = require('../models/dealer.model');
const visitModel = require('../models/visit.model');
const territoryModel = require('../models/territory.model');
const auditModel = require('../models/audit.model');
const syncModel = require('../models/sync.model');
const db = require('../config/db');

const DashboardService = {
  async getStats() {
    const [
      activeReps,
      pendingSyncs,
      visitsToday,
      territoriesCount
    ] = await Promise.all([
      db('users').where('role', 'rep').where('is_active', true).count('* as count').first(),
      db('sync_queue').where('status', 'pending').count('* as count').first(),
      visitModel.getVisitsToday(),
      db('territories').where('is_active', true).count('* as count').first()
    ]);

    return {
      activeReps: parseInt(activeReps.count),
      pendingSyncs: parseInt(pendingSyncs.count),
      visitsToday: parseInt(visitsToday?.count || 0),
      territoriesCount: parseInt(territoriesCount.count)
    };
  },

  async getDailyActivity() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const whereToday = (query) =>
      query.where('start_time', '>=', today).where('start_time', '<', tomorrow);

    const [
      visits,
      completed,
      onHold,
      denied,
      pending
    ] = await Promise.all([
      whereToday(db('visits')).count('* as count').first(),
      whereToday(db('visits'))
        .where(function () {
          this.where('sale_completed', true).orWhere('status', 'accepted');
        })
        .count('* as count')
        .first(),
      whereToday(db('visits')).where('status', 'hold').count('* as count').first(),
      whereToday(db('visits')).where('status', 'denied').count('* as count').first(),
      whereToday(db('visits')).where('status', 'pending').count('* as count').first()
    ]);

    return {
      visits: parseInt(visits.count || 0),
      completed: parseInt(completed.count || 0),
      onHold: parseInt(onHold.count || 0),
      denied: parseInt(denied.count || 0),
      pending: parseInt(pending.count || 0)
    };
  },

  async getQuickLinks() {
    const [usersCount, dealersCount, visitsCount, activeRepsCount] = await Promise.all([
      db('users').count('* as count').first(),
      db('dealers').count('* as count').first(),
      db('visits').count('* as count').first(),
      db('users').where('role', 'rep').where('is_active', true).count('* as count').first()
    ]);

    return {
      users: parseInt(usersCount.count),
      dealers: parseInt(dealersCount.count),
      visits: parseInt(visitsCount.count),
      activeReps: parseInt(activeRepsCount.count)
    };
  },

  async getRecentActivities(limit = 10) {
    return await auditModel.getRecent(limit);
  },

  async getRecentVisits(limit = 10) {
    return await visitModel.getRecentVisits(limit);
  }
};

module.exports = DashboardService;

