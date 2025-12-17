const syncService = require('../../services/sync.service');
const visitService = require('../../services/visit.service');
const dealerService = require('../../services/dealer.service');

const SyncController = {
  async getPending(req, res, next) {
    try {
      const pending = await syncService.getPending(req.user.id);
      res.json({ pending });
    } catch (error) {
      next(error);
    }
  },

  async push(req, res, next) {
    try {
      const { items } = req.body; // Array of sync items

      const results = [];

      for (const item of items) {
        try {
          let result;
          
          switch (item.entity_type) {
            case 'visit':
              if (item.operation === 'create') {
                result = await visitService.create(item.data);
              } else if (item.operation === 'update') {
                result = await visitService.update(item.entity_id, item.data);
              }
              break;
            case 'dealer':
              if (item.operation === 'create') {
                result = await dealerService.create(item.data);
              } else if (item.operation === 'update') {
                result = await dealerService.update(item.entity_id, item.data);
              }
              break;
          }

          if (result) {
            await syncService.markSynced(item.id);
            results.push({
              id: item.id,
              status: 'success',
              entity_type: item.entity_type,
              operation: item.operation,
              data: result
            });
          }
        } catch (error) {
          await syncService.markFailed(item.id, error.message);
          results.push({ id: item.id, status: 'failed', error: error.message });
        }
      }

      res.json({ results });
    } catch (error) {
      next(error);
    }
  },

  async getPendingCount(req, res, next) {
    try {
      const count = await syncService.getPendingCount(req.user.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = SyncController;

