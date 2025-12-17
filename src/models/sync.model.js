const db = require('../config/db');

const SyncModel = {
  async create(data) {
    const [item] = await db('sync_queue').insert(data).returning('*');
    return item;
  },

  async findById(id) {
    return await db('sync_queue').where('id', id).first();
  },

  async findPending(userId) {
    return await db('sync_queue')
      .where('user_id', userId)
      .where('status', 'pending')
      .orderBy('created_at', 'asc');
  },

  async updateStatus(id, status, errorMessage = null) {
    const updateData = {
      status,
      synced_at: status === 'completed' ? db.fn.now() : null,
      error_message: errorMessage
    };
    
    if (status === 'failed') {
      await db('sync_queue')
        .where('id', id)
        .increment('retry_count', 1);
    }

    const [item] = await db('sync_queue')
      .where('id', id)
      .update(updateData)
      .returning('*');
    return item;
  },

  async delete(id) {
    return await db('sync_queue').where('id', id).del();
  },

  async getPendingCount(userId) {
    const result = await db('sync_queue')
      .where('user_id', userId)
      .where('status', 'pending')
      .count('* as count')
      .first();
    return parseInt(result.count);
  }
};

module.exports = SyncModel;

