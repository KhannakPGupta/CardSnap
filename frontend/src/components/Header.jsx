import React from 'react';
import { CreditCard, ExternalLink, Download, RefreshCw } from 'lucide-react';

export default function Header({ status, onRefresh }) {
  const isConfigured = status?.google_sheets_configured;
  const count = status?.contact_count;
  const sheetId = status?.spreadsheet_id;
  const localExcelCount = status?.local_excel_count ?? 0;

  const sheetUrl = sheetId 
    ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
    : null;

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              CardSnap
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                MVP
              </span>
            </span>
          </div>
        </div>

        {/* Status Badges & Actions */}
        <div className="flex items-center space-x-3">
          {isConfigured ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Google Sheet Connected
                {count !== null && count !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 font-semibold text-emerald-300">
                    {count} contacts
                  </span>
                )}
              </div>

              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Local Excel Active ({localExcelCount} contacts)
            </div>
          )}

          {/* Download Excel File Button */}
          <a
            href="http://localhost:8000/api/download-excel"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 transition-all border border-indigo-500/30"
            title="Download local CardSnap_Contacts.xlsx spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download Excel</span>
          </a>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Status"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

