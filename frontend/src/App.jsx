import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NetworkAnalytics from './components/NetworkAnalytics';
import ScanModal from './components/ScanModal';
import { fetchConfigStatus, fetchContacts } from './services/api';
import { CreditCard, PlusCircle, Users, BarChart3, Download, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const [configStatus, setConfigStatus] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeView, setActiveView] = useState('contacts'); // 'contacts' | 'analytics'
  const [scanModalOpen, setScanModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [statusRes, contactsRes] = await Promise.all([
        fetchConfigStatus(),
        fetchContacts()
      ]);
      setConfigStatus(statusRes);
      setContacts(contactsRes.contacts || []);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleContactSaved = () => {
    loadData();
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenScan={() => setScanModalOpen(true)}
        contactCount={contacts.length}
        googleSheetsConfigured={configStatus?.google_sheets_configured}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile / Compact Top Bar */}
        <header className="md:hidden border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">CardSnap</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveView('contacts')}
              className={`p-2 rounded-lg ${activeView === 'contacts' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`p-2 rounded-lg ${activeView === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setScanModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Scan</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {activeView === 'contacts' && (
            <Dashboard 
              onScanNew={() => setScanModalOpen(true)} 
            />
          )}

          {activeView === 'analytics' && (
            <NetworkAnalytics contacts={contacts} />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500">
          <p>CardSnap Professional — Personal Business Contact Workspace</p>
        </footer>

      </div>

      {/* Global Quick-Scan Modal */}
      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onContactSaved={handleContactSaved}
        googleSheetsConfigured={configStatus?.google_sheets_configured}
      />

    </div>
  );
}
