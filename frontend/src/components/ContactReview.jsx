import React, { useState } from 'react';
import { BACKEND_URL } from '../services/api';
import {
  User, Briefcase, Building, Phone, Mail, Globe, Link, MapPin, FileText,
  AlertTriangle, Save, RotateCcw, ChevronDown, ChevronUp, Terminal, Sparkles, CheckCircle2
} from 'lucide-react';

export default function ContactReview({ scanData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: scanData?.name?.value || '',
    job_title: scanData?.job_title?.value || '',
    company: scanData?.company?.value || '',
    phone: scanData?.phone?.value || '',
    email: scanData?.email?.value || '',
    website: scanData?.website?.value || '',
    linkedin: scanData?.linkedin?.value || '',
    address: scanData?.address?.value || '',
    notes: scanData?.notes?.value || '',
    image_path: scanData?.card_image_filename || ''
  });

  const [showRawOcr, setShowRawOcr] = useState(false);

  const confidences = {
    name: scanData?.name?.confidence ?? 1,
    job_title: scanData?.job_title?.confidence ?? 1,
    company: scanData?.company?.confidence ?? 1,
    phone: scanData?.phone?.confidence ?? 1,
    email: scanData?.email?.confidence ?? 1,
    website: scanData?.website?.confidence ?? 1,
    linkedin: scanData?.linkedin?.confidence ?? 1,
    address: scanData?.address?.confidence ?? 1,
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const fieldsConfig = [
    { key: 'name', label: 'Full Name', icon: User, placeholder: 'e.g. Rahul Sharma' },
    { key: 'job_title', label: 'Job Title / Designation', icon: Briefcase, placeholder: 'e.g. Founder & CEO' },
    { key: 'company', label: 'Organization', icon: Building, placeholder: 'e.g. ABC Technologies' },
    { key: 'phone', label: 'Phone Contact', icon: Phone, placeholder: 'e.g. +91 98765 43210' },
    { key: 'email', label: 'Email Vector', icon: Mail, placeholder: 'e.g. rahul@abc.com' },
    { key: 'website', label: 'Web Portal', icon: Globe, placeholder: 'e.g. www.abctech.com' },
    { key: 'linkedin', label: 'LinkedIn Profile', icon: Link, placeholder: 'e.g. linkedin.com/in/rahulsharma' },
    { key: 'address', label: 'Location Matrix', icon: MapPin, placeholder: 'e.g. Chennai, Tamil Nadu' },
    { key: 'notes', label: 'Custom Intel Notes', icon: FileText, placeholder: 'Add manual notes or follow-up details...' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-2 px-2">
      <div className={`grid grid-cols-1 ${scanData?.card_image_filename ? 'lg:grid-cols-12' : ''} gap-6 items-stretch`}>
        
        {/* Left Side: The Edit Form */}
        <form onSubmit={handleSubmit} className={`${scanData?.card_image_filename ? 'lg:col-span-7' : ''} cyber-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 hud-corner`}>
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase mb-1">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> OCR PARSE VERIFIED
              </div>
              <h2 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2">
                Review Extracted Intel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Confirm parameters before committing to Database Matrix & Cloud Ledger.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition border border-transparent hover:border-cyan-500/30"
              title="Scan another card"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Fields list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fieldsConfig.map(({ key, label, icon: Icon, placeholder }) => {
              const val = formData[key];
              const conf = confidences[key];
              const isLowConfidence = val && conf !== undefined && conf < 0.85;

              return (
                <div key={key} className={`space-y-1.5 text-left ${key === 'notes' || key === 'address' ? 'sm:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      {label}
                    </label>
                    
                    {isLowConfidence ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" /> VERIFY
                      </span>
                    ) : val ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CONFIDENT
                      </span>
                    ) : null}
                  </div>

                  <div className="relative">
                    <input
                      type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                      value={val}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full bg-slate-950/90 border text-slate-100 placeholder-slate-600 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition ${
                        isLowConfidence
                          ? 'border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                          : 'border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Raw OCR Debug Toggle */}
          {scanData?.raw_ocr && scanData.raw_ocr.length > 0 && (
            <div className="border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowRawOcr(!showRawOcr)}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition py-1 font-mono"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showRawOcr ? 'Hide raw OCR telemetry tokens' : 'Show raw OCR telemetry tokens'}</span>
                {showRawOcr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showRawOcr && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1 text-left">
                  {scanData.raw_ocr.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-200">{item.text}</span>
                      <span className="text-cyan-400 text-[10px]">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-7 py-3 neon-btn-primary text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xl font-heading uppercase tracking-wider cursor-pointer"
            >
              <Save className="w-4 h-4 text-black" />
              <span>Commit Contact Record</span>
            </button>
          </div>

        </form>

        {/* Right Side: The Physical Card Image (Visual Vault) */}
        {scanData?.card_image_filename && (
          <div className="lg:col-span-5 cyber-panel-glow rounded-3xl p-6 flex flex-col items-center justify-between hud-corner h-full">
            <div className="w-full text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase mb-1">
                Visual Vault
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Original Image Vector</h3>
              <p className="text-xs text-slate-400">Refer to this image to verify name, emails, and address fields.</p>
            </div>
            
            <div className="w-full flex-1 flex items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-900 my-4 p-2 overflow-hidden min-h-[300px]">
              <img 
                src={`${BACKEND_URL}/api/card-image/${scanData.card_image_filename}`}
                alt="Original Business Card"
                className="max-h-[320px] object-contain rounded-lg border border-cyan-500/10 shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x250/0b0f19/22d3ee?text=Card+Image+Not+Found";
                }}
              />
            </div>
            
            <div className="w-full bg-slate-950/40 py-2.5 rounded-xl border border-slate-900/60 text-[10px] text-slate-500 font-mono text-center">
              SECURE SHA-256 IMAGE MATRIX STORAGE ACTIVE
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
