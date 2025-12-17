const db = require('../config/db');

const PasswordResetModel = {
  async create(email, token, expiresAt) {
    const [row] = await db('password_resets')
      .insert({ email, token, expires_at: expiresAt })
      .returning('*');
    return row;
  },

  async findByToken(token) {
    return db('password_resets').where({ token }).first();
  },

  async deleteByEmail(email) {
    return db('password_resets').where({ email }).del();
  },

  async deleteByToken(token) {
    return db('password_resets').where({ token }).del();
  }
};

module.exports = PasswordResetModel;


