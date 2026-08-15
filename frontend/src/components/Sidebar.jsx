import React from 'react';
import { 
  CreditCard, Users, PlusCircle, BarChart3, Settings, Download, 
  ExternalLink, Sparkles, CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeView, onViewChange, onOpenScan, contactCount, googleSheetsConfigured }) {
  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen sticky top-0 h-screen z-40 backdrop-blur-xl">
      {/* Top Section */}
      <div className="p-5 space-y-6">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              CardSnap
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                PRO
              </span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Smart Contact Hub</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenScan}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 transition transform active:scale-95 group"
        >
          <PlusCircle className="w-4 h-4 text-indigo-200 group-hover:rotate-90 transition transform duration-200" />
          <span>Scan New Card</span>
        </button>

        {/* Navigation Menu */}
        <nav className="space-y-1 pt-2">
          <button
            onClick={() => onViewChange('contacts')}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
              activeView === 'contacts' 
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Contact Book</span>
            </div>
            {contactCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                {contactCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('analytics')}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
              activeView === 'analytics' 
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4" />
              <span>Network Insights</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-5 space-y-4 border-t border-slate-800/80">
        
        {/* Quick Export Shortcuts */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">Quick Export</span>
          
          <a
            href="http://localhost:8000/api/download-excel"
            download
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white transition flex items-center justify-between border border-slate-800"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Excel (.xlsx)
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Ready</span>
          </a>

          <a
            href="http://localhost:8000/api/download-vcard"
            download
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white transition flex items-center justify-between border border-slate-800"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-sky-400" />
              vCard (.vcf)
            </span>
            <span className="text-[10px] text-sky-400 font-semibold">Phone Sync</span>
          </a>
        </div>

        {/* Sync Status Badge */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className={`w-2 h-2 rounded-full ${googleSheetsConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
            <span>{googleSheetsConfigured ? 'Google Sync Active' : 'Local Storage Active'}</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {googleSheetsConfigured ? 'Auto-syncing to cloud sheet' : 'Auto-saved to local database'}
          </p>
        </div>

      </div>
    </aside>
  );
}
