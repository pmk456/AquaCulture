const db = require('../config/db');

const DealerModel = {
  async create(data) {
    const [dealer] = await db('dealers').insert(data).returning('*');
    return dealer;
  },

  async findById(id) {
    return await db('dealers')
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
      query = query.where('dealers.territory_id', filters.territory_id);
    }
    if (filters.species) {
      query = query.where('dealers.species', filters.species);
    }
    if (filters.farm_size_min) {
      query = query.where('dealers.farm_size', '>=', filters.farm_size_min);
    }
    if (filters.farm_size_max) {
      query = query.where('dealers.farm_size', '<=', filters.farm_size_max);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('dealers.name', 'ilike', `%${filters.search}%`)
          .orWhere('dealers.phone', 'ilike', `%${filters.search}%`)
          .orWhere('dealers.address', 'ilike', `%${filters.search}%`);
      });
    }

    return await query.orderBy('dealers.created_at', 'desc');
  },

  async update(id, data) {
    const [dealer] = await db('dealers')
      .where('id', id)
      .update(data)
      .returning('*');
    return dealer;
  },

  async delete(id) {
    return await db('dealers').where('id', id).del();
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = db('dealers')
      .leftJoin('territories', 'dealers.territory_id', 'territories.id')
      .select(
        'dealers.*',
        'territories.name as territory_name'
      );

    if (filters.territory_id) {
      query = query.where('dealers.territory_id', filters.territory_id);
    }
    if (filters.species) {
      query = query.where('dealers.species', filters.species);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('dealers.name', 'ilike', `%${filters.search}%`)
          .orWhere('dealers.phone', 'ilike', `%${filters.search}%`)
          .orWhere('dealers.address', 'ilike', `%${filters.search}%`);
      });
    }

    // Get count separately without joins to avoid GROUP BY issues
    let countQuery = db('dealers');
    if (filters.territory_id) {
      countQuery = countQuery.where('territory_id', filters.territory_id);
    }
    if (filters.species) {
      countQuery = countQuery.where('species', filters.species);
    }
    if (filters.search) {
      countQuery = countQuery.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
          .orWhere('phone', 'ilike', `%${filters.search}%`)
          .orWhere('address', 'ilike', `%${filters.search}%`);
      });
    }

    const [data, countResult] = await Promise.all([
      query.clone().limit(limit).offset(offset).orderBy('dealers.created_at', 'desc'),
      countQuery.count('* as count').first()
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

module.exports = DealerModel;

