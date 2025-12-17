const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// Admin session-based auth
const requireAdminAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// API JWT-based auth
const requireApiAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(error);
  }
};

// Optional API auth (for endpoints that work with or without auth)
const optionalApiAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    const user = req.session?.user || req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

// Admin panel role check (for SSR)
const requireAdminRole = (...roles) => {
  return (req, res, next) => {
    const user = req.session?.user;
    
    if (!user) {
      return res.redirect('/login');
    }

    if (!roles.includes(user.role)) {
      return res.status(403).send('Forbidden');
    }

    next();
  };
};

module.exports = {
  requireAdminAuth,
  requireApiAuth,
  optionalApiAuth,
  requireRole,
  requireAdminRole
};

