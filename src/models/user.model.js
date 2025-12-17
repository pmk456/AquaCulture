const db = require('../config/db');

const UserModel = {
  async create(data) {
    const [user] = await db('users').insert(data).returning('*');
    return user;
  },

  async findById(id) {
    return await db('users')
      .leftJoin('territories', 'users.territory_id', 'territories.id')
      .select(
        'users.*',
        'territories.name as territory_name'
      )
      .where('users.id', id)
      .first();
  },

  async findByEmail(email) {
    return await db('users')
      .leftJoin('territories', 'users.territory_id', 'territories.id')
      .select(
        'users.*',
        'territories.name as territory_name'
      )
      .where('users.email', email)
      .first();
  },

  async findAll(filters = {}) {
    let query = db('users')
      .leftJoin('territories', 'users.territory_id', 'territories.id')
      .select(
        'users.*',
        'territories.name as territory_name'
      );

    if (filters.role) {
      query = query.where('users.role', filters.role);
    }
    if (filters.is_active !== undefined) {
      query = query.where('users.is_active', filters.is_active);
    }
    if (filters.territory_id) {
      query = query.where('users.territory_id', filters.territory_id);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('users.first_name', 'ilike', `%${filters.search}%`)
          .orWhere('users.last_name', 'ilike', `%${filters.search}%`)
          .orWhere('users.email', 'ilike', `%${filters.search}%`);
      });
    }

    return await query.orderBy('users.created_at', 'desc');
  },

  async update(id, data) {
    const [user] = await db('users')
      .where('id', id)
      .update(data)
      .returning('*');
    return user;
  },

  async delete(id) {
    return await db('users').where('id', id).del();
  },

  async updateLastLogin(id) {
    return await db('users')
      .where('id', id)
      .update({ last_login: db.fn.now() });
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = db('users')
      .leftJoin('territories', 'users.territory_id', 'territories.id')
      .select(
        'users.*',
        'territories.name as territory_name'
      );

    if (filters.role) {
      query = query.where('users.role', filters.role);
    }
    if (filters.is_active !== undefined) {
      query = query.where('users.is_active', filters.is_active);
    }
    if (filters.territory_id) {
      query = query.where('users.territory_id', filters.territory_id);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('users.first_name', 'ilike', `%${filters.search}%`)
          .orWhere('users.last_name', 'ilike', `%${filters.search}%`)
          .orWhere('users.email', 'ilike', `%${filters.search}%`);
      });
    }

    const [data, countResult] = await Promise.all([
      query.clone().limit(limit).offset(offset).orderBy('users.created_at', 'desc'),
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
  }
};

module.exports = UserModel;

