import React, { useState } from 'react';
import Scanner from './Scanner';
import CameraCapture from './CameraCapture';
import ProcessingState from './ProcessingState';
import ContactReview from './ContactReview';
import SaveState from './SaveState';
import SuccessState from './SuccessState';
import { scanCard, saveContact } from '../services/api';
import { X, AlertCircle, Sparkles } from 'lucide-react';

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
      setError(err.message || "We couldn't read this card clearly. Try taking a sharper, better-lit photo.");
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
      setError(err.message || "Extracted contact details successfully, but couldn't save.");
      setStep('review');
    }
  };

  const handleClose = () => {
    handleClearFile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 relative shadow-2xl space-y-4 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Scan Business Card</h2>
              <p className="text-xs text-slate-400">Extract & add a new contact instantly</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Processing Notice</p>
                <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
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
