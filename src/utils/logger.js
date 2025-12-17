const auditModel = require('../models/audit.model');

const logAction = async (userId, action, entityType, entityId, details = null, ipAddress = null, changes = null) => {
  try {
    await auditModel.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ipAddress,
      changes: changes ? JSON.stringify(changes) : null
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw - audit logging should not break the main flow
  }
};

module.exports = { logAction };

