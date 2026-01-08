import { Pool } from '@neondatabase/serverless';
import { config } from './config.js';

let pool;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: config.dbPoolMax,
      idleTimeoutMillis: config.dbIdleTimeout,
      connectionTimeoutMillis: config.dbConnTimeout,
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
};

export const query = (text, params) => getPool().query(text, params);

export const connect = () => getPool().connect();

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
