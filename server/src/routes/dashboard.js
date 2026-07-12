const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { ok } = require('../utils/response');
const prisma = new PrismaClient();

router.get('/kpis', authMiddleware, async (req, res) => {
  const available = await prisma.asset.count({ where: { status: 'Available' } });
  const allocated = await prisma.asset.count({ where: { status: 'Allocated' } });
  const activeBookings = await prisma.booking.count({ where: { status: 'Upcoming' } });
  const pendingTransfers = await prisma.transferRequest.count({ where: { status: 'Requested' } });
  const overdue = await prisma.allocation.findMany({
    where: { status: 'Active', expectedReturnDate: { lt: new Date() } },
    include: { asset: true },
  });
  ok(res, { available, allocated, activeBookings, pendingTransfers, overdueCount: overdue.length, overdue });
});

module.exports = router;