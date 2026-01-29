/**
 * Storage Service
 * Handles file uploads (receipts, images) to Supabase Storage
 */

import { Platform } from 'react-native';
import type { SupabaseResponse } from '../../types/supabase';
import { supabase } from './client';

const STORAGE_BUCKET = 'receipts';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

class StorageService {
  /**
   * Upload a receipt file
   */
  async uploadReceipt(
    userId: string,
    subscriptionId: string,
    fileUri: string,
    fileName?: string
  ): Promise<SupabaseResponse<{ path: string; url: string }>> {
    try {
      // Validate file
      const validation = await this.validateFile(fileUri);
      if (validation.error) {
        return {
          data: null,
          error: validation.error,
        };
      }

      // Generate file path
      const timestamp = Date.now();
      const uniqueName = fileName || `receipt-${timestamp}`;
      const path = `${userId}/${subscriptionId}/${uniqueName}`;

      // Read file
      const fileData = await this.readFile(fileUri);
      if (!fileData) {
        return {
          data: null,
          error: { message: 'Failed to read file' },
        };
      }

      // Upload to storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, fileData, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      return {
        data: {
          path: data.path,
          url: urlData.publicUrl,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to upload receipt',
        },
      };
    }
  }

  /**
   * Delete a receipt file
   */
  async deleteReceipt(
    filePath: string
  ): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to delete receipt',
        },
      };
    }
  }

  /**
   * Get signed URL for a receipt (valid for specified duration)
   */
  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<SupabaseResponse<string>> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      return { data: data.signedUrl, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to get signed URL',
        },
      };
    }
  }

  /**
   * List receipts for a subscription
   */
  async listReceipts(
    userId: string,
    subscriptionId: string
  ): Promise<SupabaseResponse<Array<{ name: string; path: string }>>> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(`${userId}/${subscriptionId}`);

      if (error) {
        return {
          data: null,
          error: { message: error.message },
        };
      }

      const files = (data || []).map(file => ({
        name: file.name,
        path: `${userId}/${subscriptionId}/${file.name}`,
      }));

      return { data: files, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to list receipts',
        },
      };
    }
  }

  /**
   * Validate file before upload
   */
  private async validateFile(
    fileUri: string
  ): Promise<SupabaseResponse<null>> {
    try {
      // Get file size
      const fileSize = await this.getFileSize(fileUri);
      if (fileSize > MAX_FILE_SIZE) {
        return {
          data: null,
          error: {
            message: `File size exceeds limit (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'File validation failed',
        },
      };
    }
  }

  /**
   * Read file from URI
   */
  private async readFile(fileUri: string): Promise<Blob | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, fileUri should be a File object or blob
        if (fileUri instanceof Blob) {
          return fileUri;
        }
        const response = await fetch(fileUri);
        return await response.blob();
      } else {
        // For native, read from file system
        // This is a simplified version - you might need to use a library like react-native-fs
        const response = await fetch(fileUri);
        return await response.blob();
      }
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  /**
   * Get file size
   */
  private async getFileSize(fileUri: string): Promise<number> {
    try {
      const response = await fetch(fileUri, { method: 'HEAD' });
      const size = response.headers.get('content-length');
      return size ? parseInt(size, 10) : 0;
    } catch (error) {
      // Fallback: assume file is valid
      return 0;
    }
  }
}

export const storageService = new StorageService();
