const db = require('../config/db');

const VisitModel = {
  async create(data) {
    const [id] = await db('visits').insert(data);
    return this.findById(id);
  },

  async findById(id) {
    return db('visits')
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
        'dealers.address as dealer_address',
        'reps.first_name as rep_first_name',
        'reps.last_name as rep_last_name',
        'reps.email as rep_email'
      );

    if (filters.dealer_id) {
      query.where('visits.dealer_id', filters.dealer_id);
    }
    if (filters.rep_id) {
      query.where('visits.rep_id', filters.rep_id);
    }
    if (filters.visit_type) {
      query.where('visits.visit_type', filters.visit_type);
    }
    if (filters.start_date) {
      query.where('visits.start_time', '>=', filters.start_date);
    }
    if (filters.end_date) {
      query.where('visits.start_time', '<=', filters.end_date);
    }
    if (filters.is_synced !== undefined) {
      query.where('visits.is_synced', filters.is_synced);
    }

    return query.orderBy('visits.start_time', 'desc');
  },

  async update(id, data) {
    await db('visits').where('id', id).update(data);
    return this.findById(id);
  },

  async delete(id) {
    return db('visits').where('id', id).del();
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    let baseQuery = db('visits')
      .leftJoin('dealers', 'visits.dealer_id', 'dealers.id')
      .leftJoin('users as reps', 'visits.rep_id', 'reps.id');

    if (filters.dealer_id) {
      baseQuery.where('visits.dealer_id', filters.dealer_id);
    }
    if (filters.rep_id) {
      baseQuery.where('visits.rep_id', filters.rep_id);
    }
    if (filters.visit_type) {
      baseQuery.where('visits.visit_type', filters.visit_type);
    }
    if (filters.start_date) {
      baseQuery.where('visits.start_time', '>=', filters.start_date);
    }
    if (filters.end_date) {
      baseQuery.where('visits.start_time', '<=', filters.end_date);
    }

    const data = await baseQuery
      .clone()
      .select(
        'visits.*',
        'dealers.name as dealer_name',
        'dealers.address as dealer_address',
        'reps.first_name as rep_first_name',
        'reps.last_name as rep_last_name',
        'reps.email as rep_email'
      )
      .orderBy('visits.start_time', 'desc')
      .limit(limit)
      .offset(offset);

    const countResult = await baseQuery
      .clone()
      .clearSelect()
      .count({ count: 'visits.id' });

    const total = Number(countResult[0].count);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async getRecentVisits(limit = 10) {
    return db('visits')
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
    return db('visits')
      .whereRaw('DATE(start_time) = CURDATE()')
      .count({ count: '*' })
      .first();
  }
};

module.exports = VisitModel;
