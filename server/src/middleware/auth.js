const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

exports.authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return fail(res, 'No token provided', 401);
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    fail(res, 'Invalid or expired token', 401);
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return fail(res, 'Forbidden: insufficient role', 403);
  next();
};