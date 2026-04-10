// R2 Storage utilities - client-side helpers
// Actual uploads happen via API routes in the admin app

export interface UploadProgress {
  progress: number;
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
  downloadURL?: string;
  error?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

/**
 * Generate a safe file name for storage
 */
export function generateSafeFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
    .substring(0, 30); // Limit length
  return `${timestamp}_${randomStr}_${safeName}.${extension}`;
}

/**
 * Upload a single image to Supabase Storage via server API
 * @param file - The file to upload
 * @param path - Storage path (e.g., 'products/abc123', 'users/profile')
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with download URL
 */
export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const fileName = generateSafeFileName(file.name);
  const fullPath = `${path}/${fileName}`;

  onProgress?.({ progress: 10, state: 'running' });

  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', fullPath);

    onProgress?.({ progress: 30, state: 'running' });

    // Upload via API route (server-side with SERVICE_ROLE_KEY)
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    onProgress?.({ progress: 80, state: 'running' });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();

    onProgress?.({ progress: 100, state: 'success', downloadURL: result.url });

    return {
      url: result.url,
      path: fullPath,
      fileName,
    };
  } catch (error) {
    const err = error as Error;
    onProgress?.({ progress: 0, state: 'error', error: err.message });
    throw error;
  }
}

/**
 * Upload multiple images to R2 Storage
 * @param files - Array of files to upload
 * @param path - Storage path
 * @param onProgress - Optional callback for individual upload progress
 * @returns Promise with array of download URLs
 */
export async function uploadMultipleImages(
  files: File[],
  path: string,
  onProgress?: (index: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i], path, (progress) => {
      onProgress?.(i, progress);
    });
    results.push(result);
  }

  return results;
}

/**
 * Delete an image from R2 Storage by URL
 * @param url - The URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extract the path from the URL
    const urlObj = new URL(url);
    const path = urlObj.pathname.startsWith('/')
      ? urlObj.pathname.substring(1)
      : urlObj.pathname;

    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn('Error deleting image:', error.error);
    }
  } catch (error) {
    console.warn('Error deleting image:', error);
  }
}

/**
 * Delete multiple images from R2 Storage
 * @param urls - Array of URLs to delete
 */
export async function deleteMultipleImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => deleteImage(url)));
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @param allowedTypes - Allowed MIME types (default: common image types)
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Create a preview URL for a file (for displaying before upload)
 * @param file - The file to preview
 * @returns Object URL for the file
 */
export function createPreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free up memory
 * @param url - The object URL to revoke
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}
