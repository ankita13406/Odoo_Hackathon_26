const router = require("express").Router();

const { authMiddleware, requireRole } = require("../middleware/auth");
const { ok, fail } = require("../utils/response");
const { notify } = require("../utils/notify");
const { logActivity } = require("../utils/log");
const prisma = require("../config/prisma");

router.post(
  "/allocate",
  authMiddleware,
  requireRole("Admin", "AssetManager"),
  async (req, res, next) => {
    try {
      const { assetId, employeeId, departmentId, expectedReturnDate } =
        req.body;
      if (!assetId) {
        return fail(res, "assetId is required", 400);
      }

      const asset = await prisma.asset.findUnique({ where: { id: assetId } });
      if (!asset) {
        return fail(res, "Asset not found", 404);
      }

      const existing = await prisma.allocation.findFirst({
        where: { assetId, status: "Active" },
        include: { asset: true },
      });

      if (existing) {
        const holder = existing.employeeId
          ? await prisma.employee.findUnique({
              where: { id: existing.employeeId },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                departmentId: true,
                status: true,
              },
            })
          : null;
        return res.status(409).json({
          success: false,
          error: `Already allocated to ${holder?.name || "someone"}`,
          data: { currentHolder: holder, allocationId: existing.id },
        });
      }
      const allocation = await prisma.$transaction(async (tx) => {
        const a = await tx.allocation.create({
          data: {
            assetId,
            employeeId,
            departmentId,
            expectedReturnDate: expectedReturnDate
              ? new Date(expectedReturnDate)
              : null,
          },
        });
        await tx.asset.update({
          where: { id: assetId },
          data: { status: "Allocated" },
        });
        return a;
      });
      if (employeeId) {
        notify(prisma)(
          employeeId,
          "AssetAssigned",
          `You've been assigned asset #${assetId}`,
        ).catch((e) => console.error("notify failed:", e));
      }
      logActivity(prisma)(req.user.id, "ALLOCATE", "Asset", assetId).catch(
        (e) => console.error("logActivity failed:", e),
      );
      ok(res, allocation, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.post("/transfer-request", authMiddleware, async (req, res, next) => {
  try {
    const { assetId, fromEmployeeId, toEmployeeId, reason } = req.body;
    if (!assetId || !toEmployeeId) {
      return fail(res, "assetId and toEmployeeId are required", 400);
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return fail(res, "Asset not found", 404);
    }
    const t = await prisma.transferRequest.create({
      data: { assetId, fromEmployeeId, toEmployeeId, reason },
    });
    ok(res, t, 201);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/transfer-request/:id/approve",
  authMiddleware,
  requireRole("Admin", "AssetManager", "DepartmentHead"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return fail(res, "Invalid transfer request id", 400);
      }

      const existing = await prisma.transferRequest.findUnique({
        where: { id },
      });
      if (!existing) {
        return fail(res, "Transfer request not found", 404);
      }
      if (existing.status !== "Pending") {
        return fail(res, "Transfer request already processed", 400);
      }

      const { t, newAlloc } = await prisma.$transaction(async (tx) => {
        const t = await tx.transferRequest.update({
          where: { id },
          data: { status: "Approved", approvedBy: req.user.id },
        });
        await tx.allocation.updateMany({
          where: { assetId: t.assetId, status: "Active" },
          data: { status: "Returned", returnedAt: new Date() },
        });
        const newAlloc = await tx.allocation.create({
          data: {
            assetId: t.assetId,
            employeeId: t.toEmployeeId,
            status: "Active",
          },
        });
        await tx.asset.update({
          where: { id: t.assetId },
          data: { status: "Allocated" },
        });
        return { t, newAlloc };
      });

      if (t.toEmployeeId) {
        notify(prisma)(
          t.toEmployeeId,
          "TransferApproved",
          `Asset #${t.assetId} transferred to you`,
        ).catch((e) => console.error("notify failed:", e));
      }
      logActivity(prisma)(
        req.user.id,
        "TRANSFER_APPROVE",
        "Asset",
        t.assetId,
      ).catch((e) => console.error("logActivity failed:", e));
      ok(res, newAlloc);
    } catch (err) {
      next(err);
    }
  },
);

router.post("/return/:allocationId", authMiddleware, async (req, res, next) => {
  try {
    const { conditionNotes } = req.body;
    const id = Number(req.params.allocationId);
    if (!Number.isInteger(id)) {
      return fail(res, "Invalid allocation id", 400);
    }

    const existing = await prisma.allocation.findUnique({ where: { id } });
    if (!existing) {
      return fail(res, "Allocation not found", 404);
    }
    if (existing.status !== "Active") {
      return fail(res, "Allocation is not active", 400);
    }

    const alloc = await prisma.$transaction(async (tx) => {
      const a = await tx.allocation.update({
        where: { id },
        data: {
          status: "Returned",
          returnedAt: new Date(),
          checkInNotes: conditionNotes,
        },
      });
      await tx.asset.update({
        where: { id: a.assetId },
        data: { status: "Available" },
      });
      return a;
    });

    logActivity(prisma)(req.user.id, "RETURN", "Asset", alloc.assetId).catch(
      (e) => console.error("logActivity failed:", e),
    );

    ok(res, alloc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
