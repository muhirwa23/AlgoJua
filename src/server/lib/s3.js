import { S3Client } from '@aws-sdk/client-s3';
import { config } from './config.js';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});
