import app from './src/server/app.js';
import { config } from './src/server/lib/config.js';
import { closePool } from './src/server/lib/db.js';

const PORT = config.port;
const HOST = config.host;

let server;

// Start server only if not in serverless environment
if (config.nodeEnv !== 'production' || !process.env.VERCEL) {
  server = app.listen(PORT, HOST, () => {
    console.log(`[INFO] API server running on ${HOST}:${PORT} [${config.nodeEnv}]`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

const gracefulShutdown = async (signal) => {
  console.log(`[INFO] ${signal} received, starting graceful shutdown`);
  
  if (server) {
    server.close(async () => {
      console.log('[INFO] HTTP server closed');
      await closePool();
      console.log('[INFO] Database pool closed');
      process.exit(0);
    });
  } else {
    await closePool();
    console.log('[INFO] Database pool closed');
    process.exit(0);
  }

  setTimeout(() => {
    console.error('[ERROR] Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('[ERROR] Unhandled rejection:', reason);
});

export default app;
