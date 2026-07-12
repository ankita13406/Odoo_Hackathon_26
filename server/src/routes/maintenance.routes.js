const express = require('express');
const router = express.Router();

const prisma = require("../config/prisma");
const { authMiddleware, requireRole } = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const transitions = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['TechnicianAssigned'],
  TechnicianAssigned: ['InProgress'],
  InProgress: ['Resolved'],
};

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.query;
    const requests = await prisma.maintenanceRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    ok(res, requests);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { assetId, raisedBy, issueDescription, priority, photoUrl } = req.body;

    if (!assetId || !raisedBy || !issueDescription) {
      return fail(res, 'assetId, raisedBy and issueDescription are required');
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ success: false, error: `Asset ${assetId} not found` });
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        raisedBy,
        issueDescription,
        priority: priority || undefined, 
        photoUrl,
      },
    });

    ok(res, request, 201);
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('Admin', 'AssetManager'),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { status: nextStatus, technicianName } = req.body;

      if (!Number.isInteger(id)) {
        return fail(res, 'Invalid maintenance request id');
      }

      if (!nextStatus) {
        return fail(res, 'status is required');
      }

      const current = await prisma.maintenanceRequest.findUnique({ where: { id } });

      if (!current) {
        return res.status(404).json({ success: false, error: 'Maintenance request not found' });
      }

      if (!transitions[current.status]?.includes(nextStatus)) {
        return fail(res, `Cannot move from ${current.status} to ${nextStatus}`);
      }

      const updated = await prisma.maintenanceRequest.update({
        where: { id },
        data: {
          status: nextStatus,
          technicianName,
          resolvedAt: nextStatus === 'Resolved' ? new Date() : undefined,
        },
      });

      if (nextStatus === 'Approved') {
        await prisma.asset.update({
          where: { id: current.assetId },
          data: { status: 'UnderMaintenance' },
        });
      }

      if (nextStatus === 'Resolved') {
        await prisma.asset.update({
          where: { id: current.assetId },
          data: { status: 'Available' },
        });
      }

      ok(res, updated);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;