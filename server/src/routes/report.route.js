const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const prisma = require("../config/prisma");
const { ok } = require("../utils/response");

router.get("/department-allocation", authMiddleware, async (req, res) => {
  const rows = await prisma.allocation.groupBy({
    by: ["departmentId"],
    _count: { id: true },
    where: { status: "Active" },
  });
  ok(res, rows);
});

router.get("/maintenance-frequency", authMiddleware, async (req, res) => {
  const rows = await prisma.maintenanceRequest.groupBy({
    by: ["assetId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  ok(res, rows);
});

module.exports = router;
