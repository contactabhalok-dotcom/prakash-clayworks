'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle, GripVertical, Image as ImageIcon } from 'lucide-react';
import {
  uploadImage,
  deleteImage,
  validateImageFile,
  createPreviewURL,
  revokePreviewURL,
} from '@prakash/firebase';
import type { UploadProgress } from '@prakash/firebase';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  path: string;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  error?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  path,
  maxFiles = 10,
  maxSizeMB = 5,
  disabled = false,
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadingFiles.forEach((f) => revokePreviewURL(f.previewUrl));
    };
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const remainingSlots = maxFiles - value.length;
      if (remainingSlots <= 0) {
        alert(`Maximum ${maxFiles} images allowed`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      // Validate and create preview for each file
      const newUploadingFiles: UploadingFile[] = [];
      for (const file of filesToUpload) {
        const validation = validateImageFile(file, maxSizeMB);
        if (!validation.valid) {
          alert(validation.error);
          continue;
        }

        const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        newUploadingFiles.push({
          id,
          file,
          previewUrl: createPreviewURL(file),
          progress: 0,
        });
      }

      if (newUploadingFiles.length === 0) return;

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload each file
      for (const uploadingFile of newUploadingFiles) {
        try {
          const result = await uploadImage(uploadingFile.file, path, (progress: UploadProgress) => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id ? { ...f, progress: progress.progress } : f
              )
            );
          });

          // Remove from uploading and add to value
          setUploadingFiles((prev) => {
            const file = prev.find((f) => f.id === uploadingFile.id);
            if (file) revokePreviewURL(file.previewUrl);
            return prev.filter((f) => f.id !== uploadingFile.id);
          });

          onChange([...value, result.url]);
        } catch (error) {
          console.error('Upload error:', error);
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id
                ? { ...f, error: 'Upload failed', progress: 0 }
                : f
            )
          );
        }
      }
    },
    [value, onChange, path, maxFiles, maxSizeMB, disabled]
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
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = async (index: number) => {
    if (disabled) return;

    const urlToRemove = value[index];
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);

    // Try to delete from storage (don't block UI)
    try {
      await deleteImage(urlToRemove);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleRemoveUploading = (id: string) => {
    setUploadingFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) revokePreviewURL(file.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Drag reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newValue = [...value];
    const draggedItem = newValue[draggedIndex];
    newValue.splice(draggedIndex, 1);
    newValue.splice(index, 0, draggedItem);
    onChange(newValue);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const totalImages = value.length + uploadingFiles.length;
  const canAddMore = totalImages < maxFiles;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
            dragActive
              ? 'border-terracotta bg-terracotta/5'
              : 'border-slate-200 hover:border-slate-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 bg-slate-100 rounded-full">
              <Upload className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-slate-500 mt-1">
                JPG, PNG, GIF, WebP up to {maxSizeMB}MB each
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {value.length} of {maxFiles} images uploaded
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image grid */}
      {(value.length > 0 || uploadingFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Uploaded images */}
          {value.map((url, index) => (
            <div
              key={url}
              className={`relative aspect-square rounded-lg overflow-hidden bg-slate-100 group ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Drag handle */}
              <div className="absolute top-2 left-2 p-1 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-slate-600" />
              </div>
              {/* Index badge */}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Uploading images */}
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-100"
            >
              <img
                src={file.previewUrl}
                alt="Uploading"
                className="w-full h-full object-cover opacity-50"
              />
              {/* Progress overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                {file.error ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-xs text-white text-center px-2">{file.error}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveUploading(file.id)}
                      className="mt-2 text-xs text-white underline"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                    <div className="w-3/4 bg-white/30 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-white mt-1">{Math.round(file.progress)}%</p>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Add more placeholder */}
          {canAddMore && value.length > 0 && (
            <button
              type="button"
              onClick={() => !disabled && fileInputRef.current?.click()}
              disabled={disabled}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="h-6 w-6 text-slate-400" />
              <span className="text-xs text-slate-500">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
