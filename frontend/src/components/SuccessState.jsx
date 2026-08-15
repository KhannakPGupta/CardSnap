import React from 'react';
import { CheckCircle, ExternalLink, PlusCircle, Building, User, Phone, Mail } from 'lucide-react';

export default function SuccessState({ savedContact, spreadsheetId, totalCount, onScanAnother }) {
  const sheetUrl = spreadsheetId 
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : null;

  return (
    <div className="max-w-md mx-auto my-10 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Checkmark animation badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Contact Saved</h2>
        <p className="text-sm text-emerald-400 font-medium">
          Successfully added to your central Google Sheet
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
        {savedContact?.name && (
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold text-white text-base">{savedContact.name}</span>
          </div>
        )}
        {savedContact?.company && (
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{savedContact.company}</span>
            {savedContact.job_title && (
              <span className="text-slate-500 font-normal">({savedContact.job_title})</span>
            )}
          </div>
        )}
        {savedContact?.email && (
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{savedContact.email}</span>
          </div>
        )}
        {savedContact?.phone && (
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{savedContact.phone}</span>
          </div>
        )}

        {totalCount !== undefined && totalCount !== null && (
          <div className="border-t border-slate-800/80 pt-3 mt-2 text-right">
            <span className="text-xs font-medium text-slate-400">
              Total contacts stored: <strong className="text-indigo-400">{totalCount}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        {sheetUrl ? (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <span>Open Google Sheet</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        ) : (
          <a
            href="http://localhost:8000/api/download-excel"
            download
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium rounded-xl text-sm flex items-center justify-center gap-2 border border-indigo-500/30 transition"
          >
            <span>Download Excel Sheet</span>
            <ExternalLink className="w-4 h-4 text-indigo-400" />
          </a>
        )}

        <button
          onClick={onScanAnother}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Scan Another Card</span>
        </button>
      </div>


    </div>
  );
}
