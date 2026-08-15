import React from 'react';
import { Loader2, FileSpreadsheet } from 'lucide-react';

export default function SaveState() {
  return (
    <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          Saving to Google Sheets
        </h3>
        <p className="text-sm text-slate-400">
          Appending new contact row to your central spreadsheet...
        </p>
      </div>
    </div>
  );
}
