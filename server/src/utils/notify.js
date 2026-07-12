// utils/notify.js
exports.notify = (prisma) => async (userId, type, message) => {
  return prisma.notification.create({ data: { userId, type, message } });
};

