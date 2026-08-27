import React from 'react';
import { CreditCard, ExternalLink, Download, RefreshCw, LayoutDashboard, Camera } from 'lucide-react';
import { BACKEND_URL } from '../services/api';

export default function Header({ status, currentTab, onTabChange, onRefresh }) {
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
        
        {/* Brand & Tabs */}
        <div className="flex items-center space-x-6">
          <div 
            onClick={() => onTabChange('scan')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition transform">
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

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => onTabChange('scan')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${currentTab === 'scan' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${currentTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
              {localExcelCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-400/20 text-indigo-200 text-[10px] font-bold">
                  {localExcelCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Status Badges & Actions */}
        <div className="flex items-center space-x-3">
          {/* Mobile Tab buttons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => onTabChange('scan')}
              className={`p-2 rounded-lg text-xs ${currentTab === 'scan' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`p-2 rounded-lg text-xs ${currentTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          </div>

          {isConfigured ? (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Google Sheet Connected
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Local Ledger Active ({localExcelCount})
            </div>
          )}

          {/* Download Excel File Button */}
          <a
            href={`${BACKEND_URL}/api/download-excel`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 transition-all border border-indigo-500/30"
            title="Download CardSnap_Contacts.xlsx spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
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


