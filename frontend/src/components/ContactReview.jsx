import React, { useState } from 'react';
import {
  User,
  Briefcase,
  Building,
  Phone,
  Mail,
  Globe,
  Link,
  MapPin,
  FileText,
  AlertTriangle,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Terminal
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
    { key: 'company', label: 'Company', icon: Building, placeholder: 'e.g. ABC Technologies' },
    { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: 'e.g. +91 98765 43210' },
    { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'e.g. rahul@abc.com' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'e.g. www.abctech.com' },
    { key: 'linkedin', label: 'LinkedIn URL', icon: Link, placeholder: 'e.g. linkedin.com/in/rahulsharma' },
    { key: 'address', label: 'Address', icon: MapPin, placeholder: 'e.g. Chennai, Tamil Nadu' },
    { key: 'notes', label: 'Notes (Optional)', icon: FileText, placeholder: 'Add manual notes or follow-up details...' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Contact Found
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Review and edit the information before saving to Google Sheets.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Scan another image"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Fields list */}
        <div className="space-y-4">
          {fieldsConfig.map(({ key, label, icon: Icon, placeholder }) => {
            const val = formData[key];
            const conf = confidences[key];
            const isLowConfidence = val && conf !== undefined && conf < 0.85;

            return (
              <div key={key} className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    {label}
                  </label>
                  
                  {isLowConfidence && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Verify
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                    value={val}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-slate-950/80 border text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
                      isLowConfidence
                        ? 'border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
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
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition py-1"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showRawOcr ? 'Hide raw OCR detected text' : 'Show raw OCR detected text'}</span>
              {showRawOcr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRawOcr && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1 text-left">
                {scanData.raw_ocr.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-200">{item.text}</span>
                    <span className="text-slate-500 text-[10px]">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Contact</span>
          </button>
        </div>

      </form>
    </div>
  );
}
