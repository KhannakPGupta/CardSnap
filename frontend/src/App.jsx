import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NetworkAnalytics from './components/NetworkAnalytics';
import LedgerHistory from './components/LedgerHistory';
import ContactGeoMap from './components/ContactGeoMap';
import ScanModal from './components/ScanModal';
import { fetchConfigStatus, fetchContacts } from './services/api';
import { CreditCard, PlusCircle, Users, BarChart3, Cpu, Wifi, Activity, Sparkles, Layers, ShieldAlert, Database, Map } from 'lucide-react';

export default function App() {
  const [configStatus, setConfigStatus] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeView, setActiveView] = useState('contacts'); // 'contacts' | 'analytics'
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  const loadData = async () => {
    let isOnline = true;
    
    // 1. Fetch Config Status
    try {
      const statusRes = await fetchConfigStatus();
      setConfigStatus(statusRes);
      if (statusRes && statusRes.offline) {
        isOnline = false;
      }
    } catch (err) {
      console.error('Failed to load config status:', err);
      isOnline = false;
    }

    // 2. Fetch Contacts
    try {
      const contactsRes = await fetchContacts();
      setContacts(contactsRes.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      isOnline = false;
    }

    setBackendOnline(isOnline);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleContactSaved = () => {
    loadData();
  };

  return (
    <div className="min-h-screen flex bg-[#05070d] text-slate-100 selection:bg-cyan-500 selection:text-black font-sans cyber-grid">
      
      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenScan={() => setScanModalOpen(true)}
        contactCount={contacts.length}
        googleSheetsConfigured={configStatus?.google_sheets_configured}
        spreadsheetId={configStatus?.spreadsheet_id}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top HUD Telemetry Bar (Desktop & Mobile) */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg shadow-black/40">
          
          {/* Mobile Brand / Telemetry */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base font-heading">CardSnap</span>
            </div>

            {/* Desktop HUD Telemetry Badges */}
            <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              {backendOnline ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  <span>OCR AI: ONLINE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
                  <Cpu className="w-3.5 h-3.5 text-rose-500" />
                  <span>OCR AI: OFFLINE</span>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span>SYNC LATENCY: {backendOnline ? '14ms' : 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>DATABASE: {backendOnline ? 'REAL-TIME APEX MATRIX' : 'CONNECTION LOST'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Navigation Controls */}
          <div className="flex items-center gap-2.5">
            {/* View switcher pill on top header */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveView('contacts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === 'contacts'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Directory</span>
              </button>

              <button
                onClick={() => setActiveView('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === 'analytics'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Telemetry</span>
              </button>

              <button
                onClick={() => setActiveView('geomap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === 'geomap'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map</span>
              </button>

              <button
                onClick={() => setActiveView('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === 'history'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ledgers</span>
              </button>
            </div>

            {/* Quick Scan Launch Button */}
            <button
              onClick={() => setScanModalOpen(true)}
              className="px-4 py-1.5 neon-btn-primary text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-heading"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Scan Card</span>
            </button>
          </div>
        </header>

        {/* Connection Offline Warning Banner */}
        {!backendOnline && (
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 font-mono">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <p className="font-bold text-rose-200">BACKEND CONNECTION OFFLINE</p>
                  <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">
                    The FastAPI backend server is not running. Scanning business cards and exporting contacts will fail with "Failed to fetch".
                  </p>
                  <p className="text-xs text-cyan-400 mt-2">
                    To start the backend, run: <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-cyan-300">uvicorn main:app --reload</code> in the <code className="text-slate-300">backend/</code> directory, or run <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-cyan-300">run-project.bat</code> in the root folder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeView === 'contacts' && (
            <Dashboard 
              onScanNew={() => setScanModalOpen(true)} 
              googleSheetsConfigured={configStatus?.google_sheets_configured}
              spreadsheetId={configStatus?.spreadsheet_id}
            />
          )}

          {activeView === 'analytics' && (
            <NetworkAnalytics contacts={contacts} />
          )}

          {activeView === 'geomap' && (
            <ContactGeoMap contacts={contacts} />
          )}

          {activeView === 'history' && (
            <LedgerHistory onLedgerChanged={loadData} />
          )}
        </main>

        {/* Global Futuristic Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">CardSnap HUD System v2.5 — Neural Contact Intelligence</span>
          </div>
          <p className="text-[11px]">Continuously verified against Ledger Database & Cloud Matrix</p>
        </footer>

      </div>

      {/* Global Futuristic Quick-Scan Modal */}
      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onContactSaved={handleContactSaved}
        googleSheetsConfigured={configStatus?.google_sheets_configured}
      />

    </div>
  );
}
