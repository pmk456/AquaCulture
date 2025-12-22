const db = require('../config/db');

const DealerModel = {
  async create(data) {
    const [id] = await db('dealers').insert(data);
    return this.findById(id);
  },

  async findById(id) {
    return db('dealers')
      .leftJoin('territories', 'dealers.territory_id', 'territories.id')
      .select(
        'dealers.*',
        'territories.name as territory_name'
      )
      .where('dealers.id', id)
      .first();
  },

  async findAll(filters = {}) {
    let query = db('dealers')
      .leftJoin('territories', 'dealers.territory_id', 'territories.id')
      .select(
        'dealers.*',
        'territories.name as territory_name'
      );

    if (filters.territory_id) {
      query.where('dealers.territory_id', filters.territory_id);
    }
    if (filters.species) {
      query.where('dealers.species', filters.species);
    }
    if (filters.farm_size_min) {
      query.where('dealers.farm_size', '>=', filters.farm_size_min);
    }
    if (filters.farm_size_max) {
      query.where('dealers.farm_size', '<=', filters.farm_size_max);
    }
    if (filters.search) {
      query.where(function () {
        this.where('dealers.name', 'like', `%${filters.search}%`)
          .orWhere('dealers.phone', 'like', `%${filters.search}%`)
          .orWhere('dealers.address', 'like', `%${filters.search}%`);
      });
    }

    return query.orderBy('dealers.created_at', 'desc');
  },

  async update(id, data) {
    await db('dealers')
      .where('id', id)
      .update(data);
    return this.findById(id);
  },

  async delete(id) {
    return db('dealers').where('id', id).del();
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    let dataQuery = db('dealers')
      .leftJoin('territories', 'dealers.territory_id', 'territories.id')
      .select(
        'dealers.*',
        'territories.name as territory_name'
      );

    if (filters.territory_id) {
      dataQuery.where('dealers.territory_id', filters.territory_id);
    }
    if (filters.species) {
      dataQuery.where('dealers.species', filters.species);
    }
    if (filters.search) {
      dataQuery.where(function () {
        this.where('dealers.name', 'like', `%${filters.search}%`)
          .orWhere('dealers.phone', 'like', `%${filters.search}%`)
          .orWhere('dealers.address', 'like', `%${filters.search}%`);
      });
    }

    let countQuery = db('dealers');

    if (filters.territory_id) {
      countQuery.where('territory_id', filters.territory_id);
    }
    if (filters.species) {
      countQuery.where('species', filters.species);
    }
    if (filters.search) {
      countQuery.where(function () {
        this.where('name', 'like', `%${filters.search}%`)
          .orWhere('phone', 'like', `%${filters.search}%`)
          .orWhere('address', 'like', `%${filters.search}%`);
      });
    }

    const [data, countResult] = await Promise.all([
      dataQuery
        .clone()
        .orderBy('dealers.created_at', 'desc')
        .limit(limit)
        .offset(offset),

      countQuery.count({ count: '*' })
    ]);

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

module.exports = DealerModel;
