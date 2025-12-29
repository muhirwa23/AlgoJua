import { uploadApi } from './api';

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadImageToR2(file: File): Promise<UploadResult> {
  return uploadApi.upload(file);
}

export async function deleteImageFromR2(key: string): Promise<void> {
  return uploadApi.delete(key);
}

export function getImageUrlFromKey(key: string): string {
  return key;
}
