const { AppError, ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', err);

  // If it's an API request, return JSON
  if (req.path.startsWith('/api')) {
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: err.message,
        code: 'VALIDATION_ERROR'
      });
    }

    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: err.message,
        code: 'NOT_FOUND'
      });
    }

    if (err instanceof UnauthorizedError) {
      return res.status(401).json({
        error: err.message,
        code: 'UNAUTHORIZED'
      });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.code,
        ...(err.errors && { errors: err.errors })
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: err.message
    });
  }

  // For admin routes, render error page or redirect
  if (err instanceof AppError) {
    if (err.statusCode === 404) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: err.message,
        user: req.session?.user
      });
    }
    if (err.statusCode === 403) {
      return res.status(403).render('error', {
        title: 'Forbidden',
        message: err.message,
        user: req.session?.user
      });
    }
  }

  // Default error page
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.statusCode || 500).render('error', {
    title: err.name || 'Error',
    message: err.message || 'An unexpected error occurred',
    error: isDev ? err : {}, // Pass actual error object in dev
    user: req.session?.user
  });
};

module.exports = errorHandler;

