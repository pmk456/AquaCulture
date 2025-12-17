const visitModel = require('../models/visit.model');
const territoryModel = require('../models/territory.model');
const userModel = require('../models/user.model');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { isInsidePolygon } = require('../utils/geofence');

const VisitService = {
  async create(data) {
    // Validate required fields
    if (!data.dealer_id || !data.rep_id || !data.visit_type || !data.start_time) {
      throw new ValidationError('Missing required fields');
    }

    const visitData = {
      dealer_id: data.dealer_id,
      rep_id: data.rep_id,
      visit_type: data.visit_type,
      start_time: data.start_time,
      end_time: data.end_time || null,
      start_latitude: data.start_latitude || null,
      start_longitude: data.start_longitude || null,
      end_latitude: data.end_latitude || null,
      end_longitude: data.end_longitude || null,
      notes: data.notes || null,
      photos: data.photos ? JSON.stringify(data.photos) : null,
      is_synced: data.is_synced || false
    };

    return await visitModel.create(visitData);
  },

  async startVisit(data) {
    if (!data.dealer_id || !data.rep_id || !data.visit_type) {
      throw new ValidationError('Missing required fields');
    }

    // Geofence validation: Check if user is inside their assigned territory
    if (data.latitude && data.longitude) {
      const user = await userModel.findById(data.rep_id);
      if (user && user.territory_id) {
        const territory = await territoryModel.findById(user.territory_id);
        if (territory && territory.polygon_coordinates) {
          const polygon = Array.isArray(territory.polygon_coordinates) 
            ? territory.polygon_coordinates 
            : JSON.parse(territory.polygon_coordinates);
          
          if (polygon.length > 0) {
            const isInside = isInsidePolygon(data.latitude, data.longitude, polygon);
            if (!isInside) {
              throw new ValidationError('Outside assigned territory');
            }
          }
        }
      }
    }

    const visitData = {
      dealer_id: data.dealer_id,
      rep_id: data.rep_id,
      visit_type: data.visit_type,
      start_time: new Date(),
      start_latitude: data.latitude || null,
      start_longitude: data.longitude || null
    };

    return await visitModel.create(visitData);
  },

  async endVisit(id, data) {
    const visit = await visitModel.findById(id);
    if (!visit) {
      throw new NotFoundError('Visit');
    }

    if (visit.end_time) {
      throw new ValidationError('Visit already ended');
    }

    // Geofence validation: Check if user is inside their assigned territory
    if (data.latitude && data.longitude) {
      const user = await userModel.findById(visit.rep_id);
      if (user && user.territory_id) {
        const territory = await territoryModel.findById(user.territory_id);
        if (territory && territory.polygon_coordinates) {
          const polygon = Array.isArray(territory.polygon_coordinates) 
            ? territory.polygon_coordinates 
            : JSON.parse(territory.polygon_coordinates);
          
          if (polygon.length > 0) {
            const isInside = isInsidePolygon(data.latitude, data.longitude, polygon);
            if (!isInside) {
              throw new ValidationError('Outside assigned territory');
            }
          }
        }
      }
    }

    const updateData = {
      end_time: new Date(),
      end_latitude: data.latitude || null,
      end_longitude: data.longitude || null
    };

    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.photos !== undefined) {
      updateData.photos = Array.isArray(data.photos) ? JSON.stringify(data.photos) : data.photos;
    }
    if (data.status !== undefined) {
      // Validate status
      const validStatuses = ['pending', 'denied', 'hold', 'accepted'];
      if (validStatuses.includes(data.status)) {
        updateData.status = data.status;
      }
    }

    return await visitModel.update(id, updateData);
  },

  async findById(id) {
    const visit = await visitModel.findById(id);
    if (!visit) {
      throw new NotFoundError('Visit');
    }
    
    // Parse photos if they exist
    if (visit.photos) {
      try {
        visit.photos = typeof visit.photos === 'string' ? JSON.parse(visit.photos) : visit.photos;
      } catch (e) {
        visit.photos = [];
      }
    } else {
      visit.photos = [];
    }

    return visit;
  },

  async findAll(filters = {}) {
    const visits = await visitModel.findAll(filters);
    return visits.map(visit => {
      if (visit.photos) {
        try {
          visit.photos = typeof visit.photos === 'string' ? JSON.parse(visit.photos) : visit.photos;
        } catch (e) {
          visit.photos = [];
        }
      } else {
        visit.photos = [];
      }
      return visit;
    });
  },

  async update(id, data) {
    const visit = await visitModel.findById(id);
    if (!visit) {
      throw new NotFoundError('Visit');
    }

    const updateData = {};

    if (data.visit_type !== undefined) updateData.visit_type = data.visit_type;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.photos !== undefined) {
      updateData.photos = Array.isArray(data.photos) ? JSON.stringify(data.photos) : data.photos;
    }
    if (data.sale_completed !== undefined) updateData.sale_completed = data.sale_completed;
    if (data.status !== undefined) {
      const validStatuses = ['pending', 'denied', 'hold', 'accepted'];
      if (validStatuses.includes(data.status)) {
        updateData.status = data.status;
      }
    }
    if (data.manager_verified !== undefined) {
      updateData.manager_verified = !!data.manager_verified;
    }

    return await visitModel.update(id, updateData);
  },

  async delete(id) {
    const visit = await visitModel.findById(id);
    if (!visit) {
      throw new NotFoundError('Visit');
    }
    return await visitModel.delete(id);
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const result = await visitModel.paginate(filters, page, limit);
    result.data = result.data.map(visit => {
      if (visit.photos) {
        try {
          visit.photos = typeof visit.photos === 'string' ? JSON.parse(visit.photos) : visit.photos;
        } catch (e) {
          visit.photos = [];
        }
      } else {
        visit.photos = [];
      }
      return visit;
    });
    return result;
  },

  async getRecentVisits(limit = 10) {
    const visits = await visitModel.getRecentVisits(limit);
    return visits.map(visit => {
      if (visit.photos) {
        try {
          visit.photos = typeof visit.photos === 'string' ? JSON.parse(visit.photos) : visit.photos;
        } catch (e) {
          visit.photos = [];
        }
      } else {
        visit.photos = [];
      }
      return visit;
    });
  },

  async getVisitsToday() {
    const result = await visitModel.getVisitsToday();
    return parseInt(result.count);
  }
};

module.exports = VisitService;

