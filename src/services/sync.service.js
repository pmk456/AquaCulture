const syncModel = require('../models/sync.model');
const { ValidationError, NotFoundError } = require('../utils/errors');

const SyncService = {
  async createPendingSync(userId, entityType, entityId, operation, data) {
    return await syncModel.create({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      operation,
      data: JSON.stringify(data),
      status: 'pending'
    });
  },

  async getPending(userId) {
    const items = await syncModel.findPending(userId);
    return items.map(item => ({
      ...item,
      data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data
    }));
  },

  async markSynced(id) {
    return await syncModel.updateStatus(id, 'completed');
  },

  async markFailed(id, errorMessage) {
    return await syncModel.updateStatus(id, 'failed', errorMessage);
  },

  async getPendingCount(userId) {
    return await syncModel.getPendingCount(userId);
  }
};

module.exports = SyncService;

