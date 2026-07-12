const express = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { ok, fail } = require("../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { department, role, status } = req.query;

    const employees = await prisma.employee.findMany({
      where: {
        departmentId: department ? Number(department) : undefined,
        role: role || undefined,
        status: status || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        createdAt: true,
        department: true,
      },
    });

    ok(res, employees);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id/promote",
  authMiddleware,
  requireRole("Admin"),
  async (req, res, next) => {
    try {
      const { role } = req.body; // 'DepartmentHead' | 'AssetManager'

      if (!["DepartmentHead", "AssetManager"].includes(role)) {
        return fail(res, "Invalid role");
      }

      const emp = await prisma.employee.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });

      ok(res, emp);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
