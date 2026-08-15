import React from 'react';
import { 
  CreditCard, Users, PlusCircle, BarChart3, Download, 
  Sparkles, ShieldCheck, Database, Radio, Flame
} from 'lucide-react';

export default function Sidebar({ activeView, onViewChange, onOpenScan, contactCount, googleSheetsConfigured }) {
  return (
    <aside className="w-64 bg-slate-950/90 border-r border-cyan-500/20 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen sticky top-0 h-screen z-40 backdrop-blur-2xl">
      {/* Top Section */}
      <div className="p-5 space-y-6">
        
        {/* Futuristic Sci-Fi Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/25 hud-corner">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
          </div>

          <div>
            <span className="text-xl font-extrabold tracking-tight text-white font-heading flex items-center gap-1.5">
              Card<span className="text-cyan-400 text-glow-cyan">Snap</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 uppercase tracking-widest font-mono">
                AI
              </span>
            </span>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">NEURAL CONTACT MATRIX</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenScan}
          className="w-full py-3.5 px-4 neon-btn-primary text-black font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2.5 uppercase tracking-wider font-heading cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-black group-hover:rotate-180 transition transform duration-500" />
          <span>Launch AI Scanner</span>
        </button>

        {/* Navigation Menu */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 font-mono">
            Navigation Core
          </span>

          <button
            onClick={() => onViewChange('contacts')}
            className={`w-full px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition group ${
              activeView === 'contacts' 
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 transition ${activeView === 'contacts' ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
              <span className="font-heading">Contact Directory</span>
            </div>
            {contactCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-800/60">
                {contactCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('analytics')}
            className={`w-full px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition group ${
              activeView === 'analytics' 
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className={`w-4 h-4 transition ${activeView === 'analytics' ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
              <span className="font-heading">Telemetry & Analytics</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-5 space-y-4 border-t border-slate-900">
        
        {/* Quick Export Shortcuts */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 font-mono flex items-center justify-between">
            <span>Export Module</span>
            <Flame className="w-3 h-3 text-cyan-400 animate-pulse" />
          </span>
          
          <a
            href="http://localhost:8000/api/download-excel"
            download
            className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-cyan-300 transition flex items-center justify-between border border-slate-800 hover:border-cyan-500/30"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Excel (.xlsx)
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20">
              READY
            </span>
          </a>

          <a
            href="http://localhost:8000/api/download-vcard"
            download
            className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-cyan-300 transition flex items-center justify-between border border-slate-800 hover:border-cyan-500/30"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              vCard (.vcf)
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20">
              V-CARD
            </span>
          </a>
        </div>

        {/* Sync Status Cyber Widget */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs hud-corner">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${googleSheetsConfigured ? 'bg-emerald-400 shadow-md shadow-emerald-400 animate-ping' : 'bg-cyan-400 shadow-md shadow-cyan-400 animate-pulse'}`}></span>
              <span>{googleSheetsConfigured ? 'GOOGLE CLOUD SYNC' : 'LOCAL DATABASE ACTIVE'}</span>
            </div>
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {googleSheetsConfigured ? 'Real-time dual append to Google Sheets' : 'Continuous append to local Excel ledger'}
          </p>
        </div>

      </div>
    </aside>
  );
}
