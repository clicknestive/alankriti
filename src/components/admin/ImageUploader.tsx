'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to upload photo(s).');
        return;
      }

      if (data.urls && Array.isArray(data.urls)) {
        onChange([...images, ...data.urls]);
      }
    } catch (err: any) {
      setError('Network error during photo upload. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    if (images.length >= maxImages) {
      setError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }
    onChange([...images, manualUrl.trim()]);
    setManualUrl('');
    setShowUrlInput(false);
    setError(null);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[#5E7052] text-xs font-semibold uppercase tracking-wider">
          Product Photos ({images.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-[#826530] hover:text-[#C6A15B] transition-colors underline"
        >
          {showUrlInput ? 'Hide URL Input' : '+ Add via URL'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg animate-fadeIn">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Manual URL input fallback if needed */}
      {showUrlInput && (
        <form onSubmit={handleAddManualUrl} className="flex gap-2 animate-fadeIn">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/saree-photo.jpg"
            className="flex-1 border border-[#D4C5B0] focus:border-[#C6A15B] rounded-lg px-3 py-2 text-xs text-[#1C241D] outline-none bg-white"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#5E7052] text-white text-xs font-medium rounded-lg hover:bg-[#43513B] transition-colors"
          >
            Add
          </button>
        </form>
      )}

      {/* Upload Dropzone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-[#C6A15B] bg-[#F8F1E7]/80 ring-2 ring-[#C6A15B]/20'
              : 'border-[#BDCFB1] hover:border-[#C6A15B] bg-stone-50/50 hover:bg-[#F8F1E7]/30'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF6F0] border border-[#BDCFB1] flex items-center justify-center text-[#5E7052] shadow-sm">
              {uploading ? (
                <Loader2 size={22} className="animate-spin text-[#C6A15B]" />
              ) : (
                <Upload size={20} className="text-[#826530]" />
              )}
            </div>

            {uploading ? (
              <div>
                <p className="text-sm font-medium text-[#2A3425]">Uploading photo(s)...</p>
                <p className="text-xs text-[#5E7052] mt-0.5">Please wait a moment</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-[#2A3425]">
                  <span className="text-[#826530] font-semibold underline underline-offset-2">
                    Click to browse photos
                  </span>{' '}
                  or drag & drop
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Supports JPEG, PNG, WEBP, AVIF (Up to 10MB each)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative rounded-xl border border-[#D4C5B0] bg-white overflow-hidden shadow-sm aspect-square flex items-center justify-center"
            >
              {/* Image Preview */}
              <img
                src={url}
                alt={`Product photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Cover Photo Badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-[#1C241D]/90 backdrop-blur-xs text-[#C6A15B] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C6A15B]/40 shadow-sm flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>Cover Photo</span>
                </div>
              )}

              {/* Action Controls Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'left')}
                    className="p-1.5 bg-white/90 text-[#1C241D] rounded-full hover:bg-white text-xs"
                    title="Move Left"
                  >
                    ←
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-colors"
                  title="Remove photo"
                >
                  <X size={14} />
                </button>

                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'right')}
                    className="p-1.5 bg-white/90 text-[#1C241D] rounded-full hover:bg-white text-xs"
                    title="Move Right"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Quick Add More Tile */}
          {images.length < maxImages && !uploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D4C5B0] hover:border-[#C6A15B] rounded-xl flex flex-col items-center justify-center gap-1 text-[#5E7052] hover:text-[#826530] hover:bg-[#F8F1E7]/40 transition-all aspect-square"
            >
              <Plus size={20} />
              <span className="text-xs font-medium">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
