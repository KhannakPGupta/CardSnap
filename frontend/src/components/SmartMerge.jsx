import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Sparkles, Building, Briefcase, Phone, Mail, Globe, Link, MapPin, FileText, Check, ArrowRight } from 'lucide-react';
import { fetchDuplicates, mergeDuplicates } from '../services/api';

export default function SmartMerge({ isOpen, onClose, onMerged }) {
  const [clusters, setClusters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // The selected fields for the merged contact
  const [selectedFields, setSelectedFields] = useState({
    name: '',
    job_title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    linkedin: '',
    address: '',
    notes: '',
    image_path: ''
  });

  // Track which record the field is selected from (for UI highlighting)
  const [fieldSource, setFieldSource] = useState({});

  const loadClusters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDuplicates();
      setClusters(data.duplicates || []);
      setCurrentIndex(0);
    } catch (err) {
      setError('Failed to fetch duplicate clusters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadClusters();
    }
  }, [isOpen]);

  const currentCluster = clusters[currentIndex];

  // Initialize selectedFields with values from the first contact in the cluster
  useEffect(() => {
    if (currentCluster && currentCluster.contacts && currentCluster.contacts.length > 0) {
      const primary = currentCluster.contacts[0];
      const initialFields = {};
      const initialSource = {};
      
      const keys = ['name', 'job_title', 'company', 'phone', 'email', 'website', 'linkedin', 'address', 'notes', 'image_path'];
      keys.forEach(key => {
        // Find the first contact in the cluster that has a non-empty value for this field
        const contactWithValue = currentCluster.contacts.find(c => c[key]);
        const bestValue = contactWithValue ? contactWithValue[key] : primary[key] || '';
        const bestSourceId = contactWithValue ? contactWithValue.id : primary.id;
        
        initialFields[key] = bestValue;
        initialSource[key] = bestSourceId;
      });

      setSelectedFields(initialFields);
      setFieldSource(initialSource);
    }
  }, [currentCluster]);

  if (!isOpen) return null;

  const handleSelectFieldVal = (key, val, contactId) => {
    setSelectedFields(prev => ({ ...prev, [key]: val }));
    setFieldSource(prev => ({ ...prev, [key]: contactId }));
  };

  const handleFieldChange = (key, val) => {
    setSelectedFields(prev => ({ ...prev, [key]: val }));
    setFieldSource(prev => ({ ...prev, [key]: 'custom' }));
  };

  const handleMerge = async () => {
    if (!currentCluster) return;
    
    // Target contact is the first contact in the cluster
    const targetContact = currentCluster.contacts[0];
    const targetRowId = targetContact.id; // Row ID in Excel
    
    // Duplicate contacts to remove (all contacts in cluster except targetContact)
    const duplicateRowIds = currentCluster.contacts
      .map(c => c.id)
      .filter(id => id !== targetRowId);
      
    try {
      setLoading(true);
      await mergeDuplicates(targetRowId, duplicateRowIds, selectedFields);
      
      // Remove this resolved cluster from list or reload
      const newClusters = [...clusters];
      newClusters.splice(currentIndex, 1);
      setClusters(newClusters);
      
      if (currentIndex >= newClusters.length && newClusters.length > 0) {
        setCurrentIndex(newClusters.length - 1);
      }
      
      onMerged();
    } catch (err) {
      alert('Merge failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="cyber-panel-glow rounded-3xl p-6 sm:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl hud-corner flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-heading tracking-tight flex items-center gap-2">
                Smart Duplicate Merge Wizard
                <span className="text-xs px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                  {clusters.length} PENDING CLUSTERS
                </span>
              </h2>
              <p className="text-xs text-slate-400">Resolve records with overlapping emails, phone numbers, or identity patterns.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && clusters.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin"></div>
            </div>
            <p className="text-sm font-mono text-cyan-400">Scanning Database Matrix...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <p className="text-sm text-slate-300 font-mono">{error}</p>
            <button onClick={loadClusters} className="px-4 py-2 bg-slate-900 border border-slate-800 text-cyan-400 text-xs rounded-xl font-mono">
              Retry Matrix Scan
            </button>
          </div>
        ) : clusters.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-heading">Database Matrix Consistently Clean</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">No duplicates or overlapping contact vectors detected in the active Excel ledger.</p>
            </div>
            <button onClick={onClose} className="px-5 py-2.5 bg-slate-900 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400 rounded-xl text-xs uppercase font-heading font-extrabold tracking-wider">
              Return to Hub
            </button>
          </div>
        ) : (
          <div className="flex-1 space-y-6 py-2">
            {/* Cluster Navigation & Conflict Telemetry */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">CLUSTER {currentIndex + 1} of {clusters.length}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Trigger: Match on {currentCluster.type} "{currentCluster.value}"</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 rounded-xl disabled:opacity-40 disabled:hover:border-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-cyan-400" />
                </button>
                <button
                  disabled={currentIndex === clusters.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 rounded-xl disabled:opacity-40 disabled:hover:border-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>

            {/* Main Interactive Comparison Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left & Middle: Duplicate Candidates */}
              <div className="lg:col-span-8 space-y-4">
                <div className="text-left">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">DUPLICATE CARD CANDIDATES</h3>
                  <p className="text-[11px] text-slate-400">Select which value you want to preserve in the final merged record by clicking it.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentCluster.contacts.map((contact, idx) => (
                    <div key={contact.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-4 flex flex-col justify-between hover:border-slate-700 transition">
                      <div>
                        {/* Candidate Identity Header */}
                        <div className="flex items-center gap-3 border-b border-slate-900 pb-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 font-mono">
                            #{idx + 1}
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-white text-sm">{contact.name || 'Unnamed'}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">Row ID: {contact.id}</p>
                          </div>
                        </div>

                        {/* Interactive Field Values */}
                        <div className="space-y-2.5 text-xs">
                          {[
                            { key: 'name', label: 'Name', icon: Sparkles },
                            { key: 'job_title', label: 'Job Title', icon: Briefcase },
                            { key: 'company', label: 'Company', icon: Building },
                            { key: 'phone', label: 'Phone', icon: Phone },
                            { key: 'email', label: 'Email', icon: Mail },
                            { key: 'website', label: 'Website', icon: Globe },
                            { key: 'linkedin', label: 'LinkedIn', icon: Link },
                            { key: 'address', label: 'Address', icon: MapPin },
                            { key: 'notes', label: 'Notes', icon: FileText }
                          ].map(({ key, label, icon: Icon }) => {
                            const val = contact[key] || '';
                            const isSelected = selectedFields[key] === val && fieldSource[key] === contact.id;

                            return (
                              <div key={key} className="space-y-1 text-left">
                                <span className="text-[9px] font-mono text-slate-500 uppercase">{label}</span>
                                <button
                                  type="button"
                                  onClick={() => handleSelectFieldVal(key, val, contact.id)}
                                  className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition group cursor-pointer ${
                                    isSelected
                                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                                      : val
                                        ? 'bg-slate-900/50 border-slate-850 hover:border-slate-700 text-slate-300'
                                        : 'bg-slate-900/10 border-dashed border-slate-900 text-slate-600 cursor-not-allowed'
                                  }`}
                                  disabled={!val}
                                >
                                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                                  <span className="truncate flex-1 font-sans">{val || 'None'}</span>
                                  {isSelected && (
                                    <span className="w-4 h-4 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[9px] font-bold shrink-0">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Visual Vault card preview index */}
                      {contact.image_path && (
                        <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-500/70">Vault Image:</span>
                          <button
                            type="button"
                            onClick={() => handleSelectFieldVal('image_path', contact.image_path, contact.id)}
                            className={`px-3 py-1 rounded-lg border text-[10px] font-mono transition cursor-pointer ${
                              selectedFields.image_path === contact.image_path
                                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Preserve Image Asset
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Merged Contact Preview & Final Editing */}
              <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800 p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="text-left border-b border-slate-800 pb-3 mb-3">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">CONSOLIDATED PREVIEW</span>
                    <p className="text-[10px] text-slate-500">Edit fields directly to adjust the final merged record parameters.</p>
                  </div>

                  <div className="space-y-3.5 text-xs text-left">
                    {[
                      { key: 'name', label: 'Preserved Name', placeholder: 'Name' },
                      { key: 'job_title', label: 'Preserved Job Title', placeholder: 'Job Title' },
                      { key: 'company', label: 'Preserved Company', placeholder: 'Company' },
                      { key: 'phone', label: 'Preserved Phone', placeholder: 'Phone' },
                      { key: 'email', label: 'Preserved Email', placeholder: 'Email' },
                      { key: 'website', label: 'Preserved Website', placeholder: 'Website' },
                      { key: 'linkedin', label: 'Preserved LinkedIn', placeholder: 'LinkedIn' },
                      { key: 'address', label: 'Preserved Address', placeholder: 'Address' }
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[9px] font-mono text-cyan-500/80 uppercase">{label}</label>
                        <input
                          type="text"
                          value={selectedFields[key]}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                        />
                      </div>
                    ))}

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-cyan-500/80 uppercase">Consolidated Notes</label>
                      <textarea
                        value={selectedFields.notes}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        placeholder="Merged notes..."
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  {selectedFields.image_path && (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">Image attached:</span>
                      <span className="text-cyan-400 font-mono truncate max-w-[120px]">{selectedFields.image_path}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleMerge}
                    disabled={loading}
                    className="w-full py-3 neon-btn-primary text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider font-heading cursor-pointer shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10"
                  >
                    <span>Consolidate & Merge Row</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
