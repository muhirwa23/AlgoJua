import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const key = `images/${Date.now()}-${nanoid()}.${ext}`;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return `${import.meta.env.VITE_R2_PUBLIC_URL}/${key}`;
}
