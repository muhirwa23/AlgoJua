import { mediaApi, MediaItem } from './api';

export type { MediaItem };

export const mediaDb = {
  async getAll(): Promise<MediaItem[]> {
    return mediaApi.fetchAll();
  },

  async getById(id: string): Promise<MediaItem | null> {
    return mediaApi.fetchById(id);
  },

  async create(media: {
    filename: string;
    url: string;
    r2_key: string;
    file_type: string;
    file_size: number;
    width?: number;
    height?: number;
    alt_text?: string;
    caption?: string;
  }): Promise<MediaItem> {
    throw new Error('Use mediaDb.uploadMedia() instead');
  },

  async update(id: string, updates: { alt_text?: string; caption?: string }): Promise<MediaItem | null> {
    return mediaApi.update(id, updates);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await mediaApi.delete(id);
      return true;
    } catch {
      return false;
    }
  },

  async search(query: string): Promise<MediaItem[]> {
    const all = await mediaApi.fetchAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(m => 
      m.filename?.toLowerCase().includes(lowerQuery) ||
      m.alt_text?.toLowerCase().includes(lowerQuery) ||
      m.caption?.toLowerCase().includes(lowerQuery)
    );
  },

  async getAllMedia(): Promise<MediaItem[]> {
    return this.getAll();
  },

  async getMediaById(id: string): Promise<MediaItem | null> {
    return this.getById(id);
  },

  async uploadMedia(file: File, metadata?: { alt_text?: string; caption?: string }): Promise<MediaItem> {
    return mediaApi.upload(file, metadata);
  },

  async updateMedia(id: string, updates: { alt_text?: string; caption?: string }): Promise<MediaItem | null> {
    return this.update(id, updates);
  },

  async deleteMedia(id: string): Promise<boolean> {
    return this.delete(id);
  },

  async searchMedia(query: string): Promise<MediaItem[]> {
    return this.search(query);
  },
};
