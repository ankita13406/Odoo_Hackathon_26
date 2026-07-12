const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { ok, fail } = require('../utils/response');
const { authMiddleware, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const categories = await prisma.assetCategory.findMany({ orderBy: { name: 'asc' } });
  ok(res, categories);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const cat = await prisma.assetCategory.findUnique({ where: { id: Number(req.params.id) } });
  if (!cat) return fail(res, 'Category not found', 404);
  ok(res, cat);
});

// CREATE — Admin only. extraFields is a JSON object, e.g. { "warrantyPeriodMonths": 24 }
router.post('/', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { name, extraFields } = req.body;
  if (!name) return fail(res, 'name is required');
  const cat = await prisma.assetCategory.create({ data: { name, extraFields: extraFields || {} } });
  ok(res, cat, 201);
});

router.put('/:id', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { name, extraFields } = req.body;
  const cat = await prisma.assetCategory.update({
    where: { id: Number(req.params.id) },
    data: { name, extraFields },
  });
  ok(res, cat);
});

router.delete('/:id', authMiddleware, requireRole('Admin'), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.assetCategory.delete({ where: { id } });
  ok(res, { deleted: true });
});

module.exports = router;