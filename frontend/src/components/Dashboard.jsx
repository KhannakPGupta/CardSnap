import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Phone, Mail, ExternalLink, Trash2, Edit3, 
  Users, Building, MapPin, Grid, List, Plus, Copy, Check, RefreshCw, X, ShieldAlert, Sparkles,
  Zap, Globe, Share2, Cpu, Layers, Command
} from 'lucide-react';
import { fetchContacts, updateContact, deleteContact } from '../services/api';

export default function Dashboard({ onScanNew }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await fetchContacts();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.job_title || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q)
    );
  });

  // Calculate stats
  const totalCount = contacts.length;
  const companyCounts = {};
  contacts.forEach((c) => {
    if (c.company) {
      companyCounts[c.company] = (companyCounts[c.company] || 0) + 1;
    }
  });

  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const handleCopyEmails = () => {
    const emails = contacts
      .map((c) => c.email)
      .filter((e) => Boolean(e))
      .join(', ');

    if (emails) {
      navigator.clipboard.writeText(emails);
      setCopiedEmails(true);
      setTimeout(() => setCopiedEmails(false), 2000);
    } else {
      alert('No email addresses found to copy.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingContact) return;
    try {
      await updateContact(editingContact.id, editingContact);
      setEditingContact(null);
      await loadContacts();
    } catch (err) {
      alert('Failed to update contact.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteContact(deletingId);
      setDeletingId(null);
      await loadContacts();
    } catch (err) {
      alert('Failed to delete contact.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sci-Fi Futuristic Header Banner & Telemetry Overview */}
      <div className="relative overflow-hidden rounded-3xl cyber-panel-glow p-6 sm:p-8 hud-corner">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} /> 
              <span>Active Workspace Matrix</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight flex items-center gap-3">
              Business Network Hub
              <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-mono">
                {totalCount} ENTRIES
              </span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              AI-driven contact extractor and central intelligence repository. Search, edit, analyze telemetry, or capture new cards via OCR scanning.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onScanNew}
              className="px-6 py-3.5 neon-btn-primary text-black font-extrabold text-xs rounded-2xl flex items-center gap-2.5 shadow-xl font-heading cursor-pointer uppercase tracking-wider group"
            >
              <Zap className="w-4 h-4 text-black fill-current group-hover:scale-125 transition transform" />
              <span>Scan Card</span>
            </button>
            
            <button
              onClick={loadContacts}
              title="Refresh Data"
              className="p-3.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 rounded-2xl transition border border-cyan-500/30 hover:border-cyan-400 shadow-md"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Futuristic Telemetry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Stored */}
        <div className="cyber-card rounded-2xl p-5 flex items-center gap-4 hud-corner">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-extrabold text-2xl font-mono shadow-lg shadow-cyan-500/10">
            {totalCount}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 block">
              TOTAL RECORDED
            </span>
            <p className="text-sm text-white font-semibold font-heading">Contacts in Ledger</p>
            <p className="text-[11px] text-slate-400">Synced to Excel & Cloud</p>
          </div>
        </div>

        {/* Metric 2: Top Companies Distribution */}
        <div className="cyber-card rounded-2xl p-5 space-y-2 col-span-2 hud-corner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              ORGANIZATION MATRIX
            </span>
            <span className="text-[10px] font-mono text-slate-400">TOP 4 AFFILIATIONS</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {topCompanies.length > 0 ? (
              topCompanies.map(([comp, cnt]) => (
                <div key={comp} className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs flex items-center gap-2 hover:border-cyan-500/30 transition">
                  <span className="text-white font-semibold">{comp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                    {cnt}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No organization metrics recorded yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Cyber Control Deck Bar (Search & View Controls) */}
      <div className="cyber-panel rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-slate-800">
        
        {/* Holographic Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, title, email, phone, address..."
            className="w-full pl-11 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition placeholder:text-slate-500 font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls: Mode Switcher & Quick Export Deck */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'grid' 
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Quantum Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'table' 
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Data Matrix Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>
          </div>

          {/* Copy Emails */}
          <button
            onClick={handleCopyEmails}
            className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-medium rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-center gap-2"
          >
            {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedEmails ? 'Copied!' : 'Copy Emails'}</span>
          </button>

          {/* vCard Export */}
          <a
            href="http://localhost:8000/api/download-vcard"
            download
            className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-cyan-300 text-xs font-medium rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>vCard</span>
          </a>

          {/* Excel Export */}
          <a
            href="http://localhost:8000/api/download-excel"
            download
            className="px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Ledger</span>
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center space-y-4 cyber-panel rounded-3xl">
          <div className="relative w-12 h-12 mx-auto">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-8 h-8 border-2 border-indigo-500 border-b-transparent rounded-full animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-sm font-mono text-cyan-400 animate-pulse">Initializing Data Stream Matrix...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="cyber-panel rounded-3xl p-16 text-center space-y-4 hud-corner">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-heading">No Contact Records Detected</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {search ? 'No contacts matched your search query. Try broadening your parameters.' : 'Your directory matrix is currently empty. Scan your first card to begin.'}
            </p>
          </div>
          <button
            onClick={onScanNew}
            className="px-5 py-2.5 neon-btn-primary text-black font-extrabold text-xs rounded-xl inline-flex items-center gap-2 font-heading cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Scan First Card
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* QUANTUM CYBER CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContacts.map((c) => (
            <div key={c.id} className="cyber-card rounded-2xl p-6 flex flex-col justify-between hud-corner group">
              <div className="space-y-4">
                
                {/* Header Profile Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
                      <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-bold font-heading text-lg text-cyan-300">
                        {(c.name || 'C')[0].toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base font-heading group-hover:text-cyan-300 transition leading-tight">
                        {c.name || 'Unnamed Record'}
                      </h3>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">{c.job_title || 'No Title Specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditingContact(c)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
                      title="Edit Contact"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80 font-sans">
                  {c.company && (
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-semibold">{c.company}</span>
                    </div>
                  )}

                  {c.phone && (
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`tel:${c.phone}`} className="hover:text-cyan-400 font-mono transition">
                        {c.phone}
                      </a>
                    </div>
                  )}

                  {c.email && (
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`mailto:${c.email}`} className="hover:text-cyan-400 truncate transition">
                        {c.email}
                      </a>
                    </div>
                  )}

                  {c.address && (
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Status */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3.5 mt-4 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Added {c.date_added}
                </span>

                <div className="flex items-center gap-2">
                  {c.website && (
                    <a
                      href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-cyan-400 transition"
                      title={c.website}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {c.linkedin && (
                    <a
                      href={c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-sky-400 transition"
                      title={c.linkedin}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DATA MATRIX TABLE VIEW */
        <div className="cyber-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl hud-corner">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-mono uppercase tracking-wider text-cyan-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">Contact Name</th>
                  <th className="py-4 px-5">Company & Title</th>
                  <th className="py-4 px-5">Phone</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Network Links</th>
                  <th className="py-4 px-5">Date Recorded</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/60 transition group">
                    <td className="py-4 px-5 font-bold text-white font-heading">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold text-xs">
                          {(c.name || 'C')[0].toUpperCase()}
                        </div>
                        <span>{c.name || <span className="text-slate-600 font-normal italic">No Name</span>}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-100">{c.company || '—'}</div>
                      <div className="text-xs text-cyan-400 font-mono">{c.job_title}</div>
                    </td>

                    <td className="py-4 px-5 text-xs font-mono text-slate-300">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="hover:text-cyan-400 transition">
                          {c.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-4 px-5 text-xs text-slate-300">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="hover:text-cyan-400 transition">
                          {c.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {c.website && (
                          <a
                            href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-cyan-400 transition"
                            title={c.website}
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {c.linkedin && (
                          <a
                            href={c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-sky-400 transition"
                            title={c.linkedin}
                          >
                            <Share2 className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-xs font-mono text-slate-500">{c.date_added}</td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingContact(c)}
                          className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition"
                          title="Edit Contact"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FUTURISTIC EDIT MODAL */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-panel-glow rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl hud-corner animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg font-heading flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" /> Edit Contact Parameters
              </h3>
              <button onClick={() => setEditingContact(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-cyan-400 font-mono block mb-1 font-semibold">NAME</label>
                <input
                  type="text"
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-cyan-400 font-mono block mb-1 font-semibold">JOB TITLE</label>
                <input
                  type="text"
                  value={editingContact.job_title}
                  onChange={(e) => setEditingContact({ ...editingContact, job_title: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-cyan-400 font-mono block mb-1 font-semibold">COMPANY</label>
                <input
                  type="text"
                  value={editingContact.company}
                  onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-cyan-400 font-mono block mb-1 font-semibold">PHONE</label>
                <input
                  type="text"
                  value={editingContact.phone}
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-cyan-400 font-mono block mb-1 font-semibold">EMAIL</label>
                <input
                  type="text"
                  value={editingContact.email}
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-cyan-400 font-mono block mb-1 font-semibold">WEBSITE</label>
                <input
                  type="text"
                  value={editingContact.website}
                  onChange={(e) => setEditingContact({ ...editingContact, website: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-cyan-400 font-mono block mb-1 font-semibold">LINKEDIN</label>
                <input
                  type="text"
                  value={editingContact.linkedin}
                  onChange={(e) => setEditingContact({ ...editingContact, linkedin: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingContact(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 neon-btn-primary text-black font-extrabold text-xs rounded-xl font-heading uppercase tracking-wider"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FUTURISTIC DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-panel border-rose-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center hud-corner">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg font-heading">Purge Record?</h3>
              <p className="text-xs text-slate-400">
                This action will permanently delete this contact from your Excel Ledger and Database.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
