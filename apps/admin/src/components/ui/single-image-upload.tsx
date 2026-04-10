'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import {
  uploadImage,
  deleteImage,
  validateImageFile,
  createPreviewURL,
  revokePreviewURL,
} from '@prakash/firebase';
import type { UploadProgress } from '@prakash/firebase';

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  path: string;
  maxSizeMB?: number;
  disabled?: boolean;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'banner';
  placeholder?: string;
}

export function SingleImageUpload({
  value = '',
  onChange,
  path,
  maxSizeMB = 5,
  disabled = false,
  aspectRatio = 'square',
  placeholder = 'Drop image here or click to upload',
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) revokePreviewURL(previewUrl);
    };
  }, []);

  const aspectRatioClass = {
    square: 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    banner: 'aspect-[3/1]',
  }[aspectRatio];

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file || disabled) return;

      // Validate file
      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      // Create preview
      const preview = createPreviewURL(file);
      setPreviewUrl(preview);

      try {
        const result = await uploadImage(file, path, (progressData: UploadProgress) => {
          setProgress(progressData.progress);
        });

        // Cleanup preview
        revokePreviewURL(preview);
        setPreviewUrl(null);

        // Delete old image if exists
        if (value) {
          try {
            await deleteImage(value);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }

        onChange(result.url);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload image');
        revokePreviewURL(preview);
        setPreviewUrl(null);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [value, onChange, path, maxSizeMB, disabled]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleRemove = async () => {
    if (disabled || uploading) return;

    const urlToRemove = value;
    onChange('');

    // Try to delete from storage
    if (urlToRemove) {
      try {
        await deleteImage(urlToRemove);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
  };

  const displayUrl = previewUrl || value;

  return (
    <div className="space-y-2">
      <div
        className={`relative ${aspectRatioClass} rounded-xl overflow-hidden border-2 transition-colors ${
          dragActive
            ? 'border-terracotta bg-terracotta/5'
            : displayUrl
            ? 'border-transparent'
            : 'border-dashed border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          className="hidden"
          disabled={disabled || uploading}
        />

        {displayUrl ? (
          <>
            {/* Image preview */}
            <img
              src={displayUrl}
              alt="Uploaded"
              className={`w-full h-full object-cover ${uploading ? 'opacity-50' : ''}`}
            />

            {/* Upload progress overlay */}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-3" />
                <div className="w-2/3 bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-white mt-2">{Math.round(progress)}%</p>
              </div>
            )}

            {/* Remove button */}
            {!uploading && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Change image hint */}
            {!uploading && !disabled && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs text-white text-center">Click to change image</p>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="p-3 bg-slate-100 rounded-full mb-3">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 text-center">{placeholder}</p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, GIF, WebP up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
