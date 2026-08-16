import React, { useState, useEffect } from 'react';
import { 
  Database, Trash2, Download, RefreshCw, AlertTriangle, 
  Check, FileSpreadsheet, Layers, Clock, HardDrive, ShieldAlert, Plus, Edit3
} from 'lucide-react';
import { fetchLedgers, activateLedger, deleteLedger, resetContactsSheet, renameLedger } from '../services/api';

export default function LedgerHistory({ onLedgerChanged }) {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [deletingFilename, setDeletingFilename] = useState(null);
  const [activatingFilename, setActivatingFilename] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);
  const [newLabel, setNewLabel] = useState('');

  const loadLedgers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLedgers();
      setLedgers(res.ledgers || []);
    } catch (err) {
      console.error('Failed to load ledgers:', err);
      setError('Unable to stream ledger history matrix. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgers();
  }, []);

  const handleActivateConfirm = async () => {
    if (!activatingFilename) return;
    setActionLoading(true);
    try {
      await activateLedger(activatingFilename);
      setActivatingFilename(null);
      await loadLedgers();
      if (onLedgerChanged) {
        onLedgerChanged(); // Trigger reload of main directory contacts
      }
    } catch (err) {
      alert(err.message || 'Failed to activate ledger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFilename) return;
    setActionLoading(true);
    try {
      await deleteLedger(deletingFilename);
      setDeletingFilename(null);
      await loadLedgers();
    } catch (err) {
      alert(err.message || 'Failed to delete ledger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetLedger = async () => {
    setActionLoading(true);
    try {
      await resetContactsSheet();
      setShowResetConfirm(false);
      await loadLedgers();
      if (onLedgerChanged) {
        onLedgerChanged();
      }
    } catch (err) {
      alert(err.message || 'Failed to reset current ledger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameConfirm = async () => {
    if (!renamingFile || !newLabel.trim()) return;
    setActionLoading(true);
    try {
      await renameLedger(renamingFile, newLabel.trim());
      setRenamingFile(null);
      setNewLabel('');
      await loadLedgers();
      if (onLedgerChanged) {
        onLedgerChanged();
      }
    } catch (err) {
      alert(err.message || 'Failed to rename ledger');
    } finally {
      setActionLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const totalContactsBackup = ledgers.reduce((acc, l) => acc + (l.contact_count || 0), 0);
  const activeLedgerFile = ledgers.find(l => l.is_active);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sci-Fi Header Banner */}
      <div className="cyber-panel-glow rounded-3xl p-6 sm:p-8 hud-corner relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase mb-1">
                <Layers className="w-3 h-3 text-cyan-400" /> Continuous Storage Engine
              </div>
              <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
                Ledger Archives & History
              </h1>
              <p className="text-xs text-slate-400">View backups, activate past spreadsheet databases, or purge old history logs.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLedgers}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-850 hover:border-cyan-500/30 transition flex items-center justify-center cursor-pointer"
              title="Refresh ledger database lists"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 transition flex items-center gap-2 shadow-sm cursor-pointer font-heading"
              title="Archive current active ledger and initialize empty one"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cyber-card rounded-2xl p-5 space-y-2 hud-corner">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>TOTAL SHEET VOLUMES</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-glow-cyan text-white font-mono">{ledgers.length}</p>
          <p className="text-xs text-cyan-400 font-mono font-semibold">Active & Backed Up Files</p>
        </div>

        <div className="cyber-card rounded-2xl p-5 space-y-2 hud-corner">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>AGGREGATE RECORDS</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{totalContactsBackup}</p>
          <p className="text-xs text-emerald-400 font-mono font-semibold">Saved Contacts Total</p>
        </div>

        <div className="cyber-card rounded-2xl p-5 space-y-2 hud-corner">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>ACTIVE FILE SIZE</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">
            {formatSize(activeLedgerFile?.size_bytes)}
          </p>
          <p className="text-xs text-purple-400 font-mono font-semibold">
            {activeLedgerFile?.contact_count || 0} active contacts
          </p>
        </div>
      </div>

      {/* Ledger History List */}
      {loading && ledgers.length === 0 ? (
        <div className="py-24 text-center space-y-4 cyber-panel rounded-3xl">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-cyan-400 animate-pulse">Streaming database history index...</p>
        </div>
      ) : error ? (
        <div className="cyber-panel rounded-3xl p-16 text-center space-y-4 border-rose-500/20 hud-corner">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">{error}</h3>
          <button 
            onClick={loadLedgers}
            className="px-5 py-2.5 neon-btn-primary text-black font-extrabold text-xs rounded-xl font-heading"
          >
            Retry Database Connection
          </button>
        </div>
      ) : ledgers.length === 0 ? (
        <div className="cyber-panel rounded-3xl p-16 text-center space-y-4 hud-corner">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">No Ledger Files Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Your Excel storage system is uninitialized. Save a contact to create the first ledger sheet automatically.
          </p>
        </div>
      ) : (
        <div className="cyber-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl hud-corner">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-mono uppercase tracking-wider text-cyan-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">Ledger Name</th>
                  <th className="py-4 px-5">Modified Timestamp</th>
                  <th className="py-4 px-5">Record Count</th>
                  <th className="py-4 px-5">File Size</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Database Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {ledgers.map((l) => (
                  <tr key={l.filename} className={`hover:bg-slate-900/40 transition group ${l.is_active ? 'bg-cyan-500/5' : ''}`}>
                    
                    <td className="py-4 px-5 font-bold text-white font-heading">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          l.is_active 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition'
                        }`}>
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className={`${l.is_active ? 'text-cyan-300' : 'text-slate-200'} font-bold`}>
                            {l.filename}
                          </span>
                          {l.is_active && (
                            <span className="text-[10px] text-emerald-400 font-mono uppercase mt-0.5 tracking-wider font-semibold">
                              ACTIVE DIRECTORY TARGET
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{l.modified_time}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                        l.is_active 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                          : 'bg-slate-950 text-slate-400 border-slate-850'
                      }`}>
                        {l.contact_count} contacts
                      </span>
                    </td>

                    <td className="py-4 px-5 text-xs font-mono text-slate-400">
                      {formatSize(l.size_bytes)}
                    </td>

                    <td className="py-4 px-5">
                      {l.is_active ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold tracking-wider">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-850 text-slate-500 text-[10px] font-mono font-semibold">
                          ARCHIVED
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Download Ledger */}
                        <a
                          href={`http://localhost:8000/api/download-excel/${l.filename}`}
                          download
                          className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700/50"
                          title="Download Spreadsheet File"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* Rename Ledger */}
                        <button
                          onClick={() => {
                            setRenamingFile(l.filename);
                            setNewLabel(l.filename.replace("CardSnap_Contacts_", "").replace(".xlsx", "").replace("CardSnap_Contacts", ""));
                          }}
                          className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition border border-transparent hover:border-yellow-500/20 cursor-pointer"
                          title="Rename Ledger Label"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Activate / Restore Ledger */}
                        {!l.is_active && (
                          <button
                            onClick={() => setActivatingFilename(l.filename)}
                            className="p-2 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition border border-transparent hover:border-emerald-500/20 cursor-pointer"
                            title="Activate Ledger as Current Directory"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Ledger */}
                        {!l.is_active && (
                          <button
                            onClick={() => setDeletingFilename(l.filename)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20 cursor-pointer"
                            title="Delete Ledger History File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVATE CONFIRM MODAL */}
      {activatingFilename && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-panel border-cyan-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center hud-corner animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Database className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg font-heading">Restore Ledger?</h3>
              <p className="text-xs text-slate-400">
                You are setting <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300 font-mono text-[10px] break-all">{activatingFilename}</code> as the active ledger.
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-2">
                Note: The current active sheet will be safely archived so you do not lose any current records.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setActivatingFilename(null)}
                className="px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleActivateConfirm}
                className="px-5 py-2 neon-btn-primary text-black font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-1 cursor-pointer"
              >
                {actionLoading && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                <span>Activate Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingFilename && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-panel border-rose-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center hud-corner animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg font-heading">Purge History File?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete the archived sheet:
              </p>
              <p className="text-xs text-rose-300 font-mono font-bold bg-slate-950 p-2 rounded border border-rose-500/10 break-all">
                {deletingFilename}
              </p>
              <p className="text-[10px] text-slate-500 italic mt-1">
                This process is irreversible. This file will be cleared from your local disk database.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setDeletingFilename(null)}
                className="px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-1 cursor-pointer"
              >
                {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START NEW SHEET CONFIRM MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-panel border-cyan-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center hud-corner animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg font-heading">Start Fresh Ledger?</h3>
              <p className="text-xs text-slate-400">
                This will move your current active Excel ledger into a backup file and initialize a new empty active sheet.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleResetLedger}
                className="px-5 py-2 neon-btn-primary text-black font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-1 cursor-pointer"
              >
                {actionLoading && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                <span>Create Fresh Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME CONFIRM MODAL */}
      {renamingFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-panel border-cyan-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left hud-corner animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Edit3 className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-bold text-white text-lg font-heading">Rename Ledger File</h3>
              <p className="text-xs text-slate-400">
                Provide a clean, descriptive label for the ledger:
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1 break-all">
                Original: {renamingFile}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">New Label/Suffix</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Q3_Archive"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              <p className="text-[9px] text-slate-500 font-mono leading-tight">
                File will be stored as: <code className="text-cyan-300">CardSnap_Contacts_&#123;label&#125;.xlsx</code>
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setRenamingFile(null)}
                className="px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !newLabel.trim()}
                onClick={handleRenameConfirm}
                className="px-5 py-2 neon-btn-primary text-black font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-1 cursor-pointer"
              >
                {actionLoading && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                <span>Rename Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
