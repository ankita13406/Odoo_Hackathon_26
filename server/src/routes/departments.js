const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { ok, fail } = require('../utils/response');
const { authMiddleware, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET all departments (any logged-in user can view — needed for dropdowns everywhere)
router.get('/', authMiddleware, async (req, res) => {
  const departments = await prisma.department.findMany({
    include: { parent: true, children: true },
    orderBy: { name: 'asc' },
  });
  ok(res, departments);
});

// GET single department
router.get('/:id', authMiddleware, async (req, res) => {
  const dept = await prisma.department.findUnique({
    where: { id: Number(req.params.id) },
    include: { parent: true, children: true, employees: true },
  });
  if (!dept) return fail(res, 'Department not found', 404);
  ok(res, dept);
});

// CREATE — Admin only
router.post('/', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { name, headId, parentDeptId, status } = req.body;
  if (!name) return fail(res, 'name is required');
  const dept = await prisma.department.create({
    data: { name, headId: headId || null, parentDeptId: parentDeptId || null, status: status || 'Active' },
  });
  ok(res, dept, 201);
});

// UPDATE (edit) — Admin only
router.put('/:id', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { name, headId, parentDeptId, status } = req.body;
  const dept = await prisma.department.update({
    where: { id: Number(req.params.id) },
    data: { name, headId, parentDeptId, status },
  });
  ok(res, dept);
});

// DEACTIVATE — Admin only (soft delete, not a hard DELETE — keeps history intact)
router.patch('/:id/deactivate', authMiddleware, requireRole('Admin'), async (req, res) => {
  const dept = await prisma.department.update({
    where: { id: Number(req.params.id) },
    data: { status: 'Inactive' },
  });
  ok(res, dept);
});

router.delete('/:id', authMiddleware, requireRole('Admin'), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.department.delete({ where: { id } });
  ok(res, { deleted: true });
});

module.exports = router;