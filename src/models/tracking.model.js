const db = require('../config/db');

const TrackingModel = {
  async create(data) {
    const [id] = await db('tracking_locations').insert(data);
    return db('tracking_locations').where('id', id).first();
  },

  async getLatestLocations(filters = {}) {
    let baseQuery = db('tracking_locations')
      .leftJoin('users', 'tracking_locations.user_id', 'users.id')
      .leftJoin('territories', 'users.territory_id', 'territories.id')
      .select(
        'tracking_locations.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.role',
        'territories.name as territory_name'
      );

    if (filters.territory_id) {
      baseQuery.where('users.territory_id', filters.territory_id);
    }

    if (filters.user_id) {
      baseQuery.where('tracking_locations.user_id', filters.user_id);
    }

    if (filters.date) {
      baseQuery.whereRaw(
        'DATE(tracking_locations.timestamp) = ?',
        [filters.date]
      );
    }

    // latest row per user (MySQL-safe)
    const latestSubquery = db('tracking_locations')
      .select('user_id')
      .max('timestamp as max_timestamp')
      .groupBy('user_id');

    return baseQuery
      .innerJoin(latestSubquery.as('latest'), function () {
        this.on('tracking_locations.user_id', '=', 'latest.user_id')
          .andOn('tracking_locations.timestamp', '=', 'latest.max_timestamp');
      })
      .orderBy('tracking_locations.timestamp', 'desc');
  },

  async getUserHistory(userId, limit = 100) {
    return db('tracking_locations')
      .where('user_id', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
  }
};

module.exports = TrackingModel;
