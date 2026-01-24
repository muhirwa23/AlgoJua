import { config } from '../lib/config.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  
  const errorResponse = {
    error: statusCode >= 500 ? 'Internal server error' : (err.message || 'An error occurred')
  };

  if (!config.isProduction && statusCode >= 500) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
