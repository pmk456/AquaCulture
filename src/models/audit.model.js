const db = require('../config/db');

const AuditModel = {
  async create(data) {
    const [log] = await db('audit_logs').insert(data).returning('*');
    return log;
  },
  // converting this to mysql mariadb compatible syntax for broader compatibility
  async findById(id) {
    return await db('audit_logs as a')
      .leftJoin('users as u', 'a.user_id', 'u.id')
      .select(
        'a.*',
        'u.first_name',
        'u.last_name',
        'u.email'
      )
      .where('a.id', id)
      .first();
  },
  
 // same for all of this
  async finaAll(filters = {}) {
    let query = db('audit_logs as a')
      .leftJoin('users as u', 'a.user_id', 'u.id')
      .select(
        'a.*',
        'u.first_name',
        'u.last_name',
        'u.email'
      );

    if (filters.user_id) {
      query = query.where('a.user_id', filters.user_id);
    }
    if (filters.entity_type) {
      query = query.where('a.entity_type', filters.entity_type);
    }
    if (filters.action) {
      query = query.where('a.action', filters.action);
    }
    if (filters.start_date) {
      query = query.where('a.created_at', '>=', filters.start_date);
    }
    if (filters.end_date) {
      query = query.where('a.created_at', '<=', filters.end_date);
    }

    return await query.orderBy('a.created_at', 'desc');
  },
  

  async paginate(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    let query = db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .select(
        'audit_logs.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      );

    if (filters.user_id) {
      query = query.where('audit_logs.user_id', filters.user_id);
    }
    if (filters.entity_type) {
      query = query.where('audit_logs.entity_type', filters.entity_type);
    }
    if (filters.action) {
      query = query.where('audit_logs.action', filters.action);
    }
    if (filters.start_date) {
      query = query.where('audit_logs.created_at', '>=', filters.start_date);
    }
    if (filters.end_date) {
      query = query.where('audit_logs.created_at', '<=', filters.end_date);
    }

    const [data, countResult] = await Promise.all([
      query.clone().limit(limit).offset(offset).orderBy('audit_logs.created_at', 'desc'),
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

  async getRecent(limit = 10) {
    return await db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .select(
        'audit_logs.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .orderBy('audit_logs.created_at', 'desc')
      .limit(limit);
  }
};

module.exports = AuditModel;

