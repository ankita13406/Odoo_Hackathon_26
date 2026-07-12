const router = require("express").Router();

const { authMiddleware, requireRole } = require("../middleware/auth");
const { ok, fail } = require("../utils/response");
const { nextAssetTag } = require("../utils/assetTag");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post(
  "/",
  authMiddleware,
  requireRole("Admin", "AssetManager"),
  async (req, res, next) => {
    try {
      const assetTag = await nextAssetTag();

      const asset = await prisma.asset.create({
        data: { ...req.body, assetTag },
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
