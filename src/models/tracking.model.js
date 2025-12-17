const db = require('../config/db');

const TrackingModel = {
  async create(data) {
  const [id] = await db('tracking_locations').insert(data);
  return await db('tracking_locations').where('id', id).first();
  },

  async getLatestLocations(filters = {}) {
    let query = db('tracking_locations')
      .leftJoin('users', 'tracking_locations.user_id', 'users.id')
      .select(
        'tracking_locations.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.role',
        db.raw('(SELECT name FROM territories WHERE id = users.territory_id) as territory_name')
      );

    if (filters.territory_id) {
      query = query.leftJoin('territories', 'users.territory_id', 'territories.id')
        .where('users.territory_id', filters.territory_id);
    }
    if (filters.user_id) {
      query = query.where('tracking_locations.user_id', filters.user_id);
    }
    if (filters.date) {
      query = query.where(db.raw('DATE(tracking_locations.timestamp)'), filters.date);
    }

    // Get latest location for each user
    const subquery = db('tracking_locations')
      .select('user_id', db.raw('MAX(timestamp) as max_timestamp'))
      .groupBy('user_id');

    return await query
      .innerJoin(subquery.as('latest'), function() {
        this.on('tracking_locations.user_id', '=', 'latest.user_id')
          .andOn('tracking_locations.timestamp', '=', 'latest.max_timestamp');
      })
      .orderBy('tracking_locations.timestamp', 'desc');
  },

  async getUserHistory(userId, limit = 100) {
    return await db('tracking_locations')
      .where('user_id', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
  }
};

module.exports = TrackingModel;

