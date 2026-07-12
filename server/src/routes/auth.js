const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ok, fail } = require('../utils/response');
const prisma = require("../config/prisma");

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return fail(res, 'name, email, password required');
  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) return fail(res, 'Email already registered', 409);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.employee.create({ data: { name, email, passwordHash, role: 'Employee' } });
  ok(res, { id: user.id, email: user.email, role: user.role }, 201);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.employee.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return fail(res, 'Invalid credentials', 401);
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
  ok(res, { token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

module.exports = router;