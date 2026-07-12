const express = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { ok, fail } = require("../utils/response");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const { department, role, status } = req.query;

  const employees = await prisma.employee.findMany({
    where: {
      departmentId: department ? Number(department) : undefined,
      role: role || undefined,
      status: status || undefined,
    },
    include: {
      department: true,
    },
  });

  ok(res, employees);
});

router.patch(
  "/:id/promote",
  authMiddleware,
  requireRole("Admin"),
  async (req, res) => {
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
    });

    ok(res, emp);
  }
);

module.exports = router;