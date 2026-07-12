const express = require("express");
const router = express.Router();

const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/auth");
const { ok, fail } = require("../utils/response");
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetTag: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    ok(res, bookings);
  } catch (err) {
    next(err);
  }
});
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { assetId, startTime, endTime, bookedById } = req.body;

    if (!assetId || !startTime || !endTime || !bookedById) {
      return fail(
        res,
        "assetId, startTime, endTime and bookedById are required",
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return fail(
        res,
        "startTime/endTime must be valid dates with startTime before endTime",
      );
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res
        .status(404)
        .json({ success: false, error: `Asset ${assetId} not found` });
    }

    if (!asset.isBookable) {
      return fail(res, `Asset ${assetId} (${asset.name}) is not bookable`);
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        assetId,
        status: { in: ["Upcoming", "Ongoing"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: "Slot unavailable — overlaps an existing booking",
        data: conflict,
      });
    }

    const booking = await prisma.booking.create({
      data: { assetId, bookedById, startTime: start, endTime: end },
    });

    ok(res, booking, 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
