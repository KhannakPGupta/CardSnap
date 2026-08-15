import React from 'react';
import { Trash2, Sparkles, FileText, ArrowRight } from 'lucide-react';

export default function ImagePreview({ file, previewUrl, onRemove, onScan }) {
  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
      
      {/* Header info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white truncate max-w-[220px] sm:max-w-[300px]">
              {file?.name || 'Captured Business Card'}
            </p>
            <p className="text-xs text-slate-400">
              {formatSize(file?.size)}
            </p>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
          title="Remove Image"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Image container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 min-h-[220px] max-h-[360px]">
        <img
          src={previewUrl}
          alt="Business card preview"
          className="max-h-[340px] w-auto object-contain rounded-lg shadow-md"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onRemove}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition"
        >
          Replace Image
        </button>

        <button
          onClick={onScan}
          className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Scan Business Card</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

    </div>
  );
}
