import React, { useState, useRef } from 'react';
import { Upload, Camera, FileImage, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto text-center py-4 px-2">
      {/* Sci-Fi Hero Header */}
      <div className="mb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} /> 
          <span>NEURAL OPTICAL SCANNER v2.5</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
          Ingest Card Visuals into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent text-glow-cyan">
            Structured Quantum Data.
          </span>
        </h1>
        
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Multi-layer OCR text recognition extracts name, phone, email, organization, address, and online links automatically.
        </p>
      </div>

      {/* Selected Image Preview Mode or Cyber Dropzone */}

      {selectedFile ? (
        <ImagePreview
          file={selectedFile}
          previewUrl={previewUrl}
          onRemove={onClearFile}
          onScan={onStartScan}
        />
      ) : (
        <div className="space-y-6">
          {/* Main Upload Cyber Viewfinder Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-3xl p-10 sm:p-12 transition-all duration-300 bg-slate-950/80 backdrop-blur-2xl group relative overflow-hidden hud-corner border ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01] shadow-2xl shadow-cyan-500/30'
                : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90'
            }`}
          >
            {/* Animated Laser Scanning Beam on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition duration-500">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute animate-laser"></div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition transform shadow-lg shadow-cyan-500/10">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-white font-heading">
                  Drop Business Card Image Here
                </p>
                <p className="text-xs text-slate-400">
                  Or click to browse from local system matrix (<span className="text-cyan-400 font-mono font-semibold">JPG, PNG, WEBP</span>)
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> MAX 10MB
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> NEURAL OCR READY
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenCamera}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30 flex items-center gap-2.5 shadow-lg transition transform hover:-translate-y-0.5 font-heading uppercase tracking-wider cursor-pointer"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Camera Viewfinder</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 neon-btn-primary text-black font-extrabold text-xs rounded-xl flex items-center gap-2.5 shadow-xl transition transform hover:-translate-y-0.5 font-heading uppercase tracking-wider cursor-pointer"
            >
              <FileImage className="w-4 h-4 text-black" />
              <span>Browse Image File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
