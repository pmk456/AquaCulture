const db = require('../config/db');

const TerritoryModel = {
  async create(data) {
    const [id] = await db('territories').insert(data);
    return db('territories').where('id', id).first();
  },

  async findById(id) {
    const territory = await db('territories').where('id', id).first();

    if (territory) {
      const [dealersCount, repsCount, visitsCount] = await Promise.all([
        db('dealers')
          .where('territory_id', id)
          .count({ count: '*' }),

        db('users')
          .where('territory_id', id)
          .where('role', 'rep')
          .count({ count: '*' }),

        db('visits')
          .leftJoin('users', 'visits.rep_id', 'users.id')
          .where('users.territory_id', id)
          .whereRaw('visits.start_time >= NOW() - INTERVAL 30 DAY')
          .count({ count: '*' })
      ]);

      territory.stats = {
        dealers: Number(dealersCount[0].count),
        reps: Number(repsCount[0].count),
        visits_30d: Number(visitsCount[0].count)
      };
    }

    return territory;
  },

  async findAll(filters = {}) {
    let query = db('territories');

    if (filters.is_active !== undefined) {
      query.where('is_active', filters.is_active);
    }

    if (filters.search) {
      query.whereRaw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`]);
    }

    const territories = await query.orderBy('created_at', 'desc');

    for (const territory of territories) {
      const [dealersCount, repsCount, visitsCount] = await Promise.all([
        db('dealers')
          .where('territory_id', territory.id)
          .count({ count: '*' }),

        db('users')
          .where('territory_id', territory.id)
          .where('role', 'rep')
          .count({ count: '*' }),

        db('visits')
          .leftJoin('users', 'visits.rep_id', 'users.id')
          .where('users.territory_id', territory.id)
          .whereRaw('visits.start_time >= NOW() - INTERVAL 30 DAY')
          .count({ count: '*' })
      ]);

      territory.stats = {
        dealers: Number(dealersCount[0].count),
        reps: Number(repsCount[0].count),
        visits_30d: Number(visitsCount[0].count)
      };
    }

    return territories;
  },

  async update(id, data) {
    await db('territories').where('id', id).update(data);
    return db('territories').where('id', id).first();
  },

  async delete(id) {
    return db('territories').where('id', id).del();
  }
};

module.exports = TerritoryModel;
