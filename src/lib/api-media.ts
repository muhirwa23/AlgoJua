import { mediaDb, type MediaItem } from './media';

export const mediaApi = {
  async fetchAll(): Promise<MediaItem[]> {
    try {
      return await mediaDb.getAllMedia();
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new Error('Failed to fetch media');
    }
  },

  async fetchById(id: string): Promise<MediaItem | null> {
    try {
      return await mediaDb.getMediaById(id);
    } catch (error) {
      console.error(`Error fetching media ${id}:`, error);
      throw new Error('Failed to fetch media');
    }
  },

  async upload(file: File, metadata?: { alt_text?: string; caption?: string }): Promise<MediaItem> {
    try {
      return await mediaDb.uploadMedia(file, metadata);
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  },

  async update(id: string, updates: { alt_text?: string; caption?: string }): Promise<MediaItem> {
    try {
      const updated = await mediaDb.updateMedia(id, updates);
      if (!updated) {
        throw new Error('Media not found');
      }
      return updated;
    } catch (error) {
      console.error(`Error updating media ${id}:`, error);
      throw new Error('Failed to update media');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const success = await mediaDb.deleteMedia(id);
      if (!success) {
        throw new Error('Media not found');
      }
    } catch (error) {
      console.error(`Error deleting media ${id}:`, error);
      throw new Error('Failed to delete media');
    }
  },

  async search(query: string): Promise<MediaItem[]> {
    try {
      return await mediaDb.searchMedia(query);
    } catch (error) {
      console.error(`Error searching media with query "${query}":`, error);
      throw new Error('Failed to search media');
    }
  }
};

export type { MediaItem };
