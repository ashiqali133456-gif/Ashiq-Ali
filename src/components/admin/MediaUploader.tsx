/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, FileText, X } from 'lucide-react';
import { adminApi } from '../../lib/api';

interface MediaUploaderProps {
  currentUrl?: string;
  onUploaded: (url: string, filename?: string, size?: string) => void;
  accept?: string;
  label?: string;
  category?: string;
  placeholder?: string;
  showUrlInput?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  currentUrl = '',
  onUploaded,
  accept = 'image/*',
  label = 'Upload Image / File',
  category = 'General',
  placeholder = 'https://...',
  showUrlInput = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrl(currentUrl || '');
  }, [currentUrl]);

  const handleFile = async (file: File) => {
    setErrorMessage(null);

    // Max 15MB size check
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15MB limit. Please choose a smaller file.');
      return;
    }

    setIsUploading(true);

    try {
      // Read as Data URL
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          // Upload to server
          const response = await adminApi.uploadMedia(
            dataUrl,
            file.name,
            file.type,
            category
          );

          if (response && response.url) {
            setPreviewUrl(response.url);
            onUploaded(response.url, response.filename || file.name, response.size);
          } else {
            throw new Error(response.error || 'Failed to upload media file');
          }
        } catch (uploadErr: any) {
          console.error('Upload failed:', uploadErr);
          setErrorMessage(uploadErr.message || 'Error uploading file.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        setErrorMessage('Failed to read local file.');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to process file.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const isPdf = previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.includes('application/pdf');
  const isImage = !isPdf && previewUrl.length > 0;

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}

      {/* Dropzone & Picker Button */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            <span className="text-xs text-orange-400 font-medium">Uploading & saving file to server...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-orange-400 border border-slate-700">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-200">
              <span className="text-orange-400 font-bold underline">Click to choose file</span> or drag & drop here
            </p>
            <p className="text-[10px] text-slate-400">
              JPG, PNG, WEBP, SVG, or PDF up to 15MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preview Box */}
      {previewUrl && (
        <div className="flex items-center gap-3 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
          {isImage ? (
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-950"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If failed, hide broken image
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-orange-950/40 border border-orange-800 flex items-center justify-center text-orange-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>File Attached Ready</span>
            </div>
            <p className="text-[11px] text-slate-300 truncate font-mono mt-0.5" title={previewUrl}>
              {previewUrl}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewUrl('');
              onUploaded('');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Optional URL Manual Text Input */}
      {showUrlInput && (
        <div className="pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 shrink-0">Or URL:</span>
            <input
              type="text"
              value={previewUrl}
              onChange={(e) => {
                setPreviewUrl(e.target.value);
                onUploaded(e.target.value);
              }}
              placeholder={placeholder}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
