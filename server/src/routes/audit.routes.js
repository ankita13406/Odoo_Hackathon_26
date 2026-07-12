const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const prisma = require("../config/prisma");
const { ok } = require("../utils/response");

router.post(
  "/close/:id",
  authMiddleware,
  requireRole("Admin", "AssetManager"),
  async (req, res) => {
    const id = Number(req.params.id);
    const items = await prisma.auditItem.findMany({
      where: { auditCycleId: id },
    });
    for (const item of items) {
      if (item.result === "Missing")
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { status: "Lost" },
        });
      if (item.result === "Damaged")
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { condition: "Damaged" },
        });
    }
    const cycle = await prisma.auditCycle.update({
      where: { id },
      data: { status: "Closed" },
    });
    const flaggedCount = items.filter(
      (i) => i.result === "Missing" || i.result === "Damaged",
    ).length;
    ok(res, { cycle, flaggedCount });
  },
);

module.exports = router;
