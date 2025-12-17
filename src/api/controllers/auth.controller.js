const jwt = require('jsonwebtoken');
const userService = require('../../services/user.service');
const { ValidationError, UnauthorizedError } = require('../../utils/errors');
const { auditLog } = require('../../middleware/audit.middleware');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const AuthController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const user = await userService.findByEmail(email);
      
      if (!user || !user.is_active) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const isValid = await userService.verifyPassword(user, password);
      
      if (!isValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Update last login
      await userService.updateLastLogin(user.id);

      // Generate token
      const token = generateToken(user);

      // Log login
      await auditLog(req, 'login', 'user', user.id);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          territory_id: user.territory_id
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const user = req.user;
      const token = generateToken(user);

      res.json({ token });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await userService.findById(req.user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          territory_id: user.territory_id,
          territory_name: user.territory_name
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;

