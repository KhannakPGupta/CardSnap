import React, { useState } from 'react';
import Scanner from './Scanner';
import CameraCapture from './CameraCapture';
import ProcessingState from './ProcessingState';
import ContactReview from './ContactReview';
import SaveState from './SaveState';
import SuccessState from './SuccessState';
import { scanCard, saveContact } from '../services/api';
import { X, AlertCircle, Sparkles, Cpu } from 'lucide-react';

export default function ScanModal({ isOpen, onClose, onContactSaved, googleSheetsConfigured }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Scan workflow steps: 'idle' | 'processing' | 'review' | 'saving' | 'success'
  const [step, setStep] = useState('idle');
  const [scanData, setScanData] = useState(null);
  const [savedContact, setSavedContact] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectFile = (file, url) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setError(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setScanData(null);
    setStep('idle');
    setError(null);
  };

  const handleCameraCapture = (file, url) => {
    setCameraOpen(false);
    setSelectedFile(file);
    setPreviewUrl(url);
    setError(null);
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    setStep('processing');
    setError(null);

    try {
      const data = await scanCard(selectedFile);
      setScanData(data);
      setStep('review');
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || "Could not extract card data clearly. Ensure photo is well-lit and sharp.");
      setStep('idle');
    }
  };

  const handleSaveContact = async (formData) => {
    setStep('saving');
    setError(null);

    try {
      await saveContact(formData);
      setSavedContact(formData);
      setStep('success');
      if (onContactSaved) onContactSaved();
    } catch (err) {
      console.error('Save contact error:', err);
      setError(err.message || "Extracted details successfully, but database commit failed.");
      setStep('review');
    }
  };

  const handleClose = () => {
    handleClearFile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="cyber-panel-glow rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl space-y-4 my-8 hud-corner">
        
        {/* Futuristic Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg font-heading tracking-tight flex items-center gap-2">
                Card Extraction Launchpad
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  AI OCR
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">NEURAL INGESTION & DATA SYNTHESIS</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded-xl transition border border-transparent hover:border-cyan-500/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between gap-3 font-mono">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">SCAN EXCEPTION DETECTED</p>
                <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        {step === 'idle' && (
          <Scanner
            onSelectFile={handleSelectFile}
            onOpenCamera={() => setCameraOpen(true)}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onClearFile={handleClearFile}
            onStartScan={handleStartScan}
            googleSheetsConfigured={googleSheetsConfigured}
          />
        )}

        {step === 'processing' && <ProcessingState />}

        {step === 'review' && (
          <ContactReview
            scanData={scanData}
            onSave={handleSaveContact}
            onCancel={handleClearFile}
          />
        )}

        {step === 'saving' && <SaveState />}

        {step === 'success' && (
          <SuccessState
            savedContact={savedContact}
            totalCount={null}
            onScanAnother={handleClearFile}
          />
        )}

        {/* Camera Modal inside Scan Modal */}
        {cameraOpen && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setCameraOpen(false)}
          />
        )}

      </div>
    </div>
  );
}
