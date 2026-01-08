import { config } from '../lib/config.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';

  if (config.isProduction) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: message,
      error: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    }));
  } else {
    console.error(`[ERROR] ${message}`, err.stack);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  res.status(statusCode).json({
    error: config.isProduction ? 'Internal server error' : message,
    ...(config.isProduction ? {} : { stack: err.stack })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};
