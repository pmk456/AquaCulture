const db = require('../config/db');

const UserModel = {
  async create(data) {
    const [id] = await db('users').insert(data);
    return this.findById(id);
  },

  async findById(id) {
    return db('users')
      .leftJoin('territories', 'users.territory_id', 'territories.id')
      .select(
        'users.*',
        'territories.name as territory_name'
      )
      .where('users.id', id)
      .first();
  },

  async findByEmail(email) {
    return db('users')
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
      query.where('users.role', filters.role);
    }

    if (filters.is_active !== undefined) {
      query.where('users.is_active', filters.is_active);
    }

    if (filters.territory_id) {
      query.where('users.territory_id', filters.territory_id);
    }

    if (filters.search) {
      query.where(function () {
        this.where('users.first_name', 'like', `%${filters.search}%`)
          .orWhere('users.last_name', 'like', `%${filters.search}%`)
          .orWhere('users.email', 'like', `%${filters.search}%`);
      });
    }

    return query.orderBy('users.created_at', 'desc');
  },

  async update(id, data) {
    await db('users').where('id', id).update(data);
    return this.findById(id);
  },

  async delete(id) {
    return db('users').where('id', id).del();
  },

  async updateLastLogin(id) {
    return db('users')
      .where('id', id)
      .update({ last_login: db.fn.now() });
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    let baseQuery = db('users')
      .leftJoin('territories', 'users.territory_id', 'territories.id');

    if (filters.role) {
      baseQuery.where('users.role', filters.role);
    }

    if (filters.is_active !== undefined) {
      baseQuery.where('users.is_active', filters.is_active);
    }

    if (filters.territory_id) {
      baseQuery.where('users.territory_id', filters.territory_id);
    }

    if (filters.search) {
      baseQuery.where(function () {
        this.where('users.first_name', 'like', `%${filters.search}%`)
          .orWhere('users.last_name', 'like', `%${filters.search}%`)
          .orWhere('users.email', 'like', `%${filters.search}%`);
      });
    }

    const data = await baseQuery
      .clone()
      .select(
        'users.*',
        'territories.name as territory_name'
      )
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const countResult = await baseQuery
      .clone()
      .clearSelect()
      .count({ count: 'users.id' });

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
  }
};

module.exports = UserModel;