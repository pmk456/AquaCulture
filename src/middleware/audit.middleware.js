const { logAction } = require('../utils/logger');

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         null;
};

// Audit logging for admin routes
const auditAdminAction = (action, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      // Log after response is sent
      setImmediate(async () => {
        const userId = req.session?.user?.id;
        if (userId) {
          const entityId = req.params?.id || req.body?.id || null;
          const details = `${action} ${entityType}${entityId ? ` (ID: ${entityId})` : ''}`;
          
          await logAction(
            userId,
            action,
            entityType,
            entityId,
            details,
            getClientIp(req)
          );
        }
      });
      
      return originalSend.call(this, data);
    };
    next();
  };
};

// Audit logging for API routes
const auditApiAction = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
      // Log after response is sent
      setImmediate(async () => {
        const userId = req.user?.id;
        if (userId) {
          const entityId = req.params?.id || req.body?.id || null;
          const details = `${action} ${entityType}${entityId ? ` (ID: ${entityId})` : ''}`;
          
          await logAction(
            userId,
            action,
            entityType,
            entityId,
            details,
            getClientIp(req)
          );
        }
      });
      
      return originalJson.call(this, data);
    };
    next();
  };
};

// Generic audit logger
const auditLog = async (req, action, entityType, entityId = null, changes = null) => {
  const userId = req.session?.user?.id || req.user?.id;
  if (userId) {
    await logAction(
      userId,
      action,
      entityType,
      entityId,
      null,
      getClientIp(req),
      changes
    );
  }
};

module.exports = {
  auditAdminAction,
  auditApiAction,
  auditLog,
  getClientIp
};

