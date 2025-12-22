const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { sendMail } = require('../config/mail');
const { defaultTemplates, renderTemplate } = require('../config/emailTemplates');

const UserService = {
  async create(data) {
    // Validate required fields
    if (!data.email || !data.password || !data.first_name || !data.last_name) {
      throw new ValidationError('Missing required fields');
    }

    // Check if email already exists
    const existing = await userModel.findByEmail(data.email);
    if (existing) {
      throw new ValidationError('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    const userData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password_hash: passwordHash,
      role: data.role || 'rep',
      territory_id: data.territory_id || null,
      sales_target: data.sales_target ? parseFloat(data.sales_target) : null,
      is_active: 1
    };

    const user = await userModel.create(userData);
    delete user.password_hash;

    // Send welcome email for managers and reps
    if (['manager', 'rep'].includes(user.role)) {
      const appUrl = process.env.APP_URL || process.env.BASE_URL || '';
      const loginLink = appUrl ? `${appUrl}/login` : '/login';

      const subject = 'Your account has been created';
      const rendered = renderTemplate(defaultTemplates.welcome, {
        user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'there',
        login_link: loginLink
      });
      const html = rendered
        .split('\n')
        .map(line => line.trim() === '' ? '<br>' : `<p>${line}</p>`)
        .join('');

      // Fire and forget; log errors but do not block user creation
      sendMail({
        to: user.email,
        subject,
        html,
        text: rendered.replace(/<[^>]*>?/gm, '')
      }).catch(err => {
        console.warn('[mail] Failed to send welcome email:', err.message);
      });
    }

    return user;
  },

  async findById(id) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    if (user.password_hash) {
      delete user.password_hash;
    }
    return user;
  },

  
  async findByEmail(email) {
    return await userModel.findByEmail(email);
  },

  async findAll(filters = {}) {
    const users = await userModel.findAll(filters);
    return users.map(user => {
      if (user.password_hash) delete user.password_hash;
      return user;
    });
  },

  async update(id, data) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const updateData = {};

    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.email !== undefined) {
      // Check if email is already taken by another user
      const existing = await userModel.findByEmail(data.email);
      if (existing && existing.id !== parseInt(id)) {
        throw new ValidationError('Email already exists');
      }
      updateData.email = data.email;
    }
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }
    if (data.role !== undefined) updateData.role = data.role;
    if (data.territory_id !== undefined) updateData.territory_id = data.territory_id;
    if (data.sales_target !== undefined) {
      updateData.sales_target = data.sales_target ? parseFloat(data.sales_target) : null;
    }
    if (data.is_active !== undefined) updateData.is_active = 1; else if (data.is_active === false) updateData.is_active = 0;

    const updated = await userModel.update(id, updateData);
    if (updated && updated.password_hash) {
      delete updated.password_hash;
    }
    return updated;
  },

  async delete(id) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return await userModel.delete(id);
  },

  async deactivate(id) {
    return await this.update(id, { is_active: 0 });
  },

  async verifyPassword(user, password) {
    if (!user || !user.password_hash) {
      return false;
    }
    return await bcrypt.compare(password, user.password_hash);
  },

  async updateLastLogin(id) {
    return await userModel.updateLastLogin(id);
  },

  async paginate(filters = {}, page = 1, limit = 10) {
    const result = await userModel.paginate(filters, page, limit);
    result.data = result.data.map(user => {
      if (user.password_hash) delete user.password_hash;
      return user;
    });
    return result;
  }
};

module.exports = UserService;
