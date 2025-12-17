const db = require('../config/db');

const VisitModel = {
  async create(data) {
    const [visit] = await db('visits').insert(data).returning('*');
    return visit;
  },

  async findById(id) {
    return await db('visits')
      .leftJoin('dealers', 'visits.dealer_id', 'dealers.id')
      .leftJoin('users as reps', 'visits.rep_id', 'reps.id')
      .select(
        'visits.*',
        'dealers.name as dealer_name',
        'dealers.address as dealer_address',
        'reps.first_name as rep_first_name',
        'reps.last_name as rep_last_name',
        'reps.email as rep_email'
      )
      .where('visits.id', id)
      .first();
  },

  async findAll(filters = {}) {
    let query = db('visits')
      .leftJoin('dealers', 'visits.dealer_id', 'dealers.id')
      .leftJoin('users as reps', 'visits.rep_id', 'reps.id')
      .select(
        'visits.*',
        'dealers.name as dealer_name',
        'reps.first_name as rep_first_name',
        'reps.last_name as rep_last_name'
      );

    if (filters.dealer_id) {
      query = query.where('visits.dealer_id', filters.dealer_id);
    }
    if (filters.rep_id) {
      query = query.where('visits.rep_id', filters.rep_id);
    }
    if (filters.visit_type) {
      query = query.where('visits.visit_type', filters.visit_type);
    }
    if (filters.start_date) {
      query = query.where('visits.start_time', '>=', filters.start_date);
    }
    if (filters.end_date) {
      query = query.where('visits.start_time', '<=', filters.end_date);
    }
    if (filters.is_synced !== undefined) {
      query = query.where('visits.is_synced', filters.is_synced);
    }

    return await query.orderBy('visits.start_time', 'desc');
  },

  async update(id, data) {
    const [visit] = await db('visits')
      .where('id', id)
      .update(data)
      .returning('*');
    return visit;
  },

  async delete(id) {
    return await db('visits').where('id', id).del();
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = db('visits')
      .leftJoin('dealers', 'visits.dealer_id', 'dealers.id')
      .leftJoin('users as reps', 'visits.rep_id', 'reps.id')
      .select(
        'visits.*',
        'dealers.name as dealer_name',
        'reps.first_name as rep_first_name',
        'reps.last_name as rep_last_name'
      );

    if (filters.dealer_id) {
      query = query.where('visits.dealer_id', filters.dealer_id);
    }
    if (filters.rep_id) {
      query = query.where('visits.rep_id', filters.rep_id);
    }
    if (filters.visit_type) {
      query = query.where('visits.visit_type', filters.visit_type);
    }
    if (filters.start_date) {
      query = query.where('visits.start_time', '>=', filters.start_date);
    }
    if (filters.end_date) {
      query = query.where('visits.start_time', '<=', filters.end_date);
    }

    const [data, countResult] = await Promise.all([
      query.clone().limit(limit).offset(offset).orderBy('visits.start_time', 'desc'),
      query.clone().count('* as count').first()
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.count),
        pages: Math.ceil(countResult.count / limit)
      }
    };
  },

  async getRecentVisits(limit = 10) {
    return await db('visits')
      .leftJoin('dealers', 'visits.dealer_id', 'dealers.id')
      .leftJoin('users as reps', 'visits.rep_id', 'reps.id')
      .select(
        'visits.*',
        'dealers.name as dealer_name',
        'reps.first_name as rep_first_name',
        'reps.last_name as rep_last_name'
      )
      .orderBy('visits.start_time', 'desc')
      .limit(limit);
  },

  async getVisitsToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db('visits')
      .where('start_time', '>=', today)
      .where('start_time', '<', tomorrow)
      .count('* as count')
      .first();
  }
};

module.exports = VisitModel;

