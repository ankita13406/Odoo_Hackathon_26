// utils/log.js
exports.logActivity = (prisma) => async (actorId, action, entityType, entityId, metadata = {}) => {
  return prisma.activityLog.create({ data: { actorId, action, entityType, entityId, metadata } });
};