const router = require("express").Router();

const { authMiddleware, requireRole } = require("../middleware/auth");
const { ok, fail } = require("../utils/response");
const { nextAssetTag } = require("../utils/assetTag");
const prisma = require("../config/prisma");

router.post(
  "/",
  authMiddleware,
  requireRole("Admin", "AssetManager"),
  async (req, res, next) => {
    try {
      const {
        name,
        categoryId,
        serialNumber,
        location,
        acquisitionDate,
        acquisitionCost,
        condition,
        isBookable,
        photoUrl,
      } = req.body;

      if (!name || !categoryId) {
        return fail(res, "name and categoryId are required", 400);
      }

      const assetTag = await nextAssetTag();

      const asset = await prisma.asset.create({
        data: {
          name,
          categoryId,
          serialNumber,
          location,
          acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
          acquisitionCost,
          condition,
          isBookable,
          photoUrl,
          assetTag,
          status: "Available",
        },
      });

      ok(res, asset, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { q, category, status, location } = req.query;

    const assets = await prisma.asset.findMany({
      where: {
        status: status || undefined,
        categoryId: category ? Number(category) : undefined,
        location: location
          ? { contains: location, mode: "insensitive" }
          : undefined,
        OR: q
          ? [
              { assetTag: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { category: true },
    });

    ok(res, assets);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/history", authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return fail(res, "Invalid asset id", 400);
    }

    const [allocations, maintenance] = await Promise.all([
      prisma.allocation.findMany({
        where: { assetId: id },
        orderBy: { allocatedAt: "desc" },
      }),
      prisma.maintenanceRequest.findMany({
        where: { assetId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    ok(res, { allocations, maintenance });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
