import React, { useState, useRef } from 'react';
import { Upload, Camera, FileImage, Sparkles } from 'lucide-react';
import ImagePreview from './ImagePreview';

export default function Scanner({ onSelectFile, onOpenCamera, selectedFile, previewUrl, onClearFile, onStartScan, googleSheetsConfigured }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      alert('Please upload a valid image file (JPG, PNG, JPEG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image is too large. Please upload an image under 10 MB.');
      return;
    }
    
    const url = URL.createObjectURL(file);
    onSelectFile(file, url);
  };

  return (
    <div className="max-w-3xl mx-auto text-center py-8 px-4">
      {/* Hero Headline */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Instant Contact Extractor
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Turn business cards into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-300 bg-clip-text text-transparent">
            organized contacts.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
          Scan physical business cards instantly and automatically append structured rows to your spreadsheet.
        </p>
      </div>

      {/* Selected Image Preview Mode or Dropzone */}

      {selectedFile ? (
        <ImagePreview
          file={selectedFile}
          previewUrl={previewUrl}
          onRemove={onClearFile}
          onScan={onStartScan}
        />
      ) : (
        <div className="space-y-6">
          {/* Main Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glow-box cursor-pointer border-2 border-dashed rounded-3xl p-10 sm:p-14 transition-all duration-300 bg-slate-900/60 backdrop-blur-xl group relative overflow-hidden ${
              dragActive
                ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
                : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600/20 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-white">
                  Scan a business card
                </p>
                <p className="text-sm text-slate-400">
                  Drop an image here or <span className="text-indigo-400 hover:underline font-medium">browse file</span>
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Supports JPG, JPEG, PNG, WEBP (Max 10 MB)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenCamera}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 flex items-center gap-2.5 shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Camera className="w-5 h-5 text-indigo-400" />
              <span>Use Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl flex items-center gap-2.5 shadow-lg shadow-indigo-600/25 transition transform hover:-translate-y-0.5"
            >
              <FileImage className="w-5 h-5" />
              <span>Upload Business Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
