const db = require('../config/db');

const TerritoryModel = {
  async create(data) {
  const [id] = await db('territories').insert(data);
  return await db('territories').where('id', id).first();
  },

  async findById(id) {
    const territory = await db('territories').where('id', id).first();
    
    if (territory) {
      // Get stats
      const [dealersCount, repsCount, visitsCount] = await Promise.all([
        db('dealers').where('territory_id', id).count('* as count').first(),
        db('users').where('territory_id', id).where('role', 'rep').count('* as count').first(),
        db('visits')
          .leftJoin('users', 'visits.rep_id', 'users.id')
          .where('users.territory_id', id)
          .where('visits.start_time', '>=', db.raw('NOW() - INTERVAL 30 DAY'))
          .count('* as count')
          .first()
      ]);

      territory.stats = {
        dealers: parseInt(dealersCount.count),
        reps: parseInt(repsCount.count),
        visits_30d: parseInt(visitsCount.count)
      };
    }

    return territory;
  },

  async findAll(filters = {}) {
    let query = db('territories');

    if (filters.is_active !== undefined) {
      query = query.where('is_active', filters.is_active);
    }
    if (filters.search) {
      query = query.whereRaw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }

    const territories = await query.orderBy('created_at', 'desc');

    // Get stats for each territory
    for (const territory of territories) {
      const [dealersCount, repsCount, visitsCount] = await Promise.all([
        db('dealers').where('territory_id', territory.id).count('* as count').first(),
        db('users').where('territory_id', territory.id).where('role', 'rep').count('* as count').first(),
        db('visits')
          .leftJoin('users', 'visits.rep_id', 'users.id')
          .where('users.territory_id', territory.id)
          .where('visits.start_time', '>=', db.raw("NOW() - INTERVAL '30 days'"))
          .count('* as count')
          .first()
      ]);

      territory.stats = {
        dealers: parseInt(dealersCount.count),
        reps: parseInt(repsCount.count),
        visits_30d: parseInt(visitsCount.count)
      };
    }

    return territories;
  },

  async update(id, data) {
    await db('territories')
      .where('id', id)
      .update(data);
    return await db('territories').where('id', id).first();
  },

  async delete(id) {
    return await db('territories').where('id', id).del();
  }
};

module.exports = TerritoryModel;

