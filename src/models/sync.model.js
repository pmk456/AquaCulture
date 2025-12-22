const db = require('../config/db');

const SyncModel = {
  async create(data) {
    const [id] = await db('sync_queue').insert(data);
    return db('sync_queue').where('id', id).first();
  },

  async findById(id) {
    return db('sync_queue').where('id', id).first();
  },

  async findPending(userId) {
    return db('sync_queue')
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

    await db('sync_queue')
      .where('id', id)
      .update(updateData);

    return db('sync_queue').where('id', id).first();
  },

  async delete(id) {
    return db('sync_queue').where('id', id).del();
  },

  async getPendingCount(userId) {
    const result = await db('sync_queue')
      .where('user_id', userId)
      .where('status', 'pending')
      .count({ count: '*' });

    return Number(result[0].count);
  }
};

module.exports = SyncModel;
