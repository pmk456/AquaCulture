const territoryModel = require('../models/territory.model');
const { ValidationError, NotFoundError } = require('../utils/errors');

const TerritoryService = {
  async create(data) {
    if (!data.name) {
      throw new ValidationError('Territory name is required');
    }

    // Parse polygon_coordinates if it's a string
    let polygonCoords = null;
    if (data.polygon_coordinates) {
      try {
        polygonCoords = typeof data.polygon_coordinates === 'string' 
          ? JSON.parse(data.polygon_coordinates) 
          : data.polygon_coordinates;
        // Validate it's an array
        if (!Array.isArray(polygonCoords) || polygonCoords.length === 0) {
          polygonCoords = null;
        }
      } catch (e) {
        // If parsing fails, set to null
        polygonCoords = null;
      }
    }

    const territoryData = {
      name: data.name,
      description: data.description || null,
      polygon_coordinates: polygonCoords ? JSON.stringify(polygonCoords) : null,
      is_active: data.is_active !== undefined ? (data.is_active === 'true' || data.is_active === true) : true
    };

    return await territoryModel.create(territoryData);
  },

  async findById(id) {
    const territory = await territoryModel.findById(id);
    if (!territory) {
      throw new NotFoundError('Territory');
    }
    
    // Parse polygon if it exists
    if (territory.polygon_coordinates) {
      try {
        territory.polygon_coordinates = typeof territory.polygon_coordinates === 'string' 
          ? JSON.parse(territory.polygon_coordinates) 
          : territory.polygon_coordinates;
      } catch (e) {
        territory.polygon_coordinates = null;
      }
    }

    return territory;
  },

  async findAll(filters = {}) {
    const territories = await territoryModel.findAll(filters);
    return territories.map(territory => {
      if (territory.polygon_coordinates) {
        try {
          territory.polygon_coordinates = typeof territory.polygon_coordinates === 'string'
            ? JSON.parse(territory.polygon_coordinates)
            : territory.polygon_coordinates;
        } catch (e) {
          territory.polygon_coordinates = null;
        }
      }
      return territory;
    });
  },

  async update(id, data) {
    const territory = await territoryModel.findById(id);
    if (!territory) {
      throw new NotFoundError('Territory');
    }

    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.polygon_coordinates !== undefined) {
      // Parse polygon_coordinates if it's a string
      let polygonCoords = null;
      if (data.polygon_coordinates) {
        try {
          polygonCoords = typeof data.polygon_coordinates === 'string' 
            ? JSON.parse(data.polygon_coordinates) 
            : data.polygon_coordinates;
          // Validate it's an array
          if (!Array.isArray(polygonCoords) || polygonCoords.length === 0) {
            polygonCoords = null;
          }
        } catch (e) {
          polygonCoords = null;
        }
      }
      updateData.polygon_coordinates = polygonCoords ? JSON.stringify(polygonCoords) : null;
    }
    if (data.is_active !== undefined) updateData.is_active = data.is_active === 'true' || data.is_active === true;

    return await territoryModel.update(id, updateData);
  },

  async delete(id) {
    const territory = await territoryModel.findById(id);
    if (!territory) {
      throw new NotFoundError('Territory');
    }
    return await territoryModel.delete(id);
  }
};

module.exports = TerritoryService;

