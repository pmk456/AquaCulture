const userService = require('../../services/user.service');
const { auditLog } = require('../../middleware/audit.middleware');
const { sendMail } = require('../../config/mail');
const passwordResetModel = require('../../models/passwordReset.model');
const crypto = require('crypto');

const AuthController = {
  async showLogin(req, res) {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('login', { error: null, email: '' });
  },

  async login(req, res, next) {
    try {
      const { email, password, remember } = req.body;
      if (!email || !password) {
        return res.render('login', { error: 'Email and password are required', email });
      }

      const user = await userService.findByEmail(email);
      if (!user || !user.is_active) {
        return res.render('login', { error: 'Invalid credentials', email });
      }

      if (user.role === 'rep') {
        return res.render('login', { error: 'Access restricted to admin/manager accounts', email });
      }
      const isValid = await userService.verifyPassword(user, password);
      if (!isValid) {
        return res.render('login', { error: 'Invalid credentials', email });
      }

      // At this point password is correct; generate 2FA code and send via email
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      req.session.pending2FA = {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          territory_id: user.territory_id
        },
        code,
        remember: !!remember,
        expiresAt
      };

      // Send email with code (fail silently in dev if mail not configured)
      try {
        await sendMail({
          to: user.email,
          subject: 'Your AquaCulture admin verification code',
          text: `Your verification code is ${code}. It expires in 10 minutes.`,
          html: `<p>Your verification code is:</p><p style="font-size: 22px; font-weight: bold; letter-spacing: 4px;">${code}</p><p>This code expires in 10 minutes.</p>`
        });
      } catch (mailErr) {
        console.warn('Failed to send 2FA email:', mailErr.message);
      }

      const maskedEmail = user.email.replace(/(.{2}).+(@.*)/, '$1***$2');
      res.render('login-2fa', { error: null, maskedEmail });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  async verify2FA(req, res, next) {
    try {
      const { code } = req.body;
      const data = req.session.pending2FA;

      if (!data) {
        return res.redirect('/login');
      }

      if (!code || code !== data.code || Date.now() > data.expiresAt) {
        const maskedEmail = data.user.email.replace(/(.{2}).+(@.*)/, '$1***$2');
        return res.render('login-2fa', { error: 'Invalid or expired code. Please try again.', maskedEmail });
      }

      const user = data.user;

      // Update last login
      await userService.updateLastLogin(user.id);

      // Set session user
      req.session.user = {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        territory_id: user.territory_id
      };

      // Remember-me: extend session lifetime if checked
      if (data.remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      // Clear pending 2FA
      delete req.session.pending2FA;

      // Log login
      await auditLog(req, 'login', 'user', user.id);

      res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
  },

  async showForgotPassword(req, res) {
    res.render('forgot-password', { error: null, success: null });
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.render('forgot-password', { error: 'Email is required' });
      }

      const user = await userService.findByEmail(email);
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await passwordResetModel.deleteByEmail(email);
        await passwordResetModel.create(email, token, expiresAt);

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;

        try {
          await sendMail({
            to: email,
            subject: 'Reset your AquaCulture admin password',
            text: `Open this link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a> (valid for 1 hour).</p>`
          });
        } catch (mailErr) {
          console.warn('Failed to send reset email:', mailErr.message);
        }
      }

      res.render('forgot-password', {
        success: 'If that email exists in our system, a reset link has been sent.',
        error: null
      });
    } catch (error) {
      next(error);
    }
  },

  async showResetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const record = await passwordResetModel.findByToken(token);
      if (!record || new Date(record.expires_at) < new Date()) {
        return res.render('reset-password', { error: 'This reset link is invalid or has expired.', token: null });
      }
      res.render('reset-password', { error: null, token });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const record = await passwordResetModel.findByToken(token);
      if (!record || new Date(record.expires_at) < new Date()) {
        return res.render('reset-password', { error: 'This reset link is invalid or has expired.', token: null });
      }

      if (!password || password.length < 8) {
        return res.render('reset-password', { error: 'Password must be at least 8 characters.', token });
      }

      const user = await userService.findByEmail(record.email);
      if (!user) {
        return res.render('reset-password', { error: 'User not found for this reset link.', token: null });
      }

      await userService.update(user.id, { password }); // assumes service hashes internally
      await passwordResetModel.deleteByToken(token);

      res.render('login', { error: null, email: user.email });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;

