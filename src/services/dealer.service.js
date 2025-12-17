const dealerModel = require('../models/dealer.model');
const { ValidationError, NotFoundError } = require('../utils/errors');

const DealerService = {
  async create(data) {
    // Validate required fields
    if (!data.name || !data.address || !data.latitude || !data.longitude || !data.farm_size || !data.species) {
      throw new ValidationError('Missing required fields');
    }

    // Validate coordinates
    if (isNaN(data.latitude) || isNaN(data.longitude)) {
      throw new ValidationError('Invalid coordinates');
    }
    if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
      throw new ValidationError('Coordinates out of range');
    }

    const dealerData = {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      farm_size: parseFloat(data.farm_size),
      species: data.species,
      territory_id: data.territory_id || null,
      notes: data.notes || null
    };

    return await dealerModel.create(dealerData);
  },

  async findById(id) {
    const dealer = await dealerModel.findById(id);
    if (!dealer) {
      throw new NotFoundError('Dealer');
    }
    return dealer;
  },

  async findAll(filters = {}) {
    return await dealerModel.findAll(filters);
  },

  async update(id, data) {
    const dealer = await dealerModel.findById(id);
    if (!dealer) {
      throw new NotFoundError('Dealer');
    }

    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.latitude !== undefined) {
      if (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90) {
        throw new ValidationError('Invalid latitude');
      }
      updateData.latitude = parseFloat(data.latitude);
    }
    if (data.longitude !== undefined) {
      if (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180) {
        throw new ValidationError('Invalid longitude');
      }
      updateData.longitude = parseFloat(data.longitude);
    }
    if (data.farm_size !== undefined) updateData.farm_size = parseFloat(data.farm_size);
    if (data.species !== undefined) updateData.species = data.species;
    if (data.territory_id !== undefined) updateData.territory_id = data.territory_id;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await dealerModel.update(id, updateData);
  },

  async delete(id) {
    const dealer = await dealerModel.findById(id);
    if (!dealer) {
      throw new NotFoundError('Dealer');
    }
    return await dealerModel.delete(id);
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    return await dealerModel.paginate(filters, page, limit);
  }
};

module.exports = DealerService;

