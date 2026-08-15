import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Scanner from './components/Scanner';
import CameraCapture from './components/CameraCapture';
import ProcessingState from './components/ProcessingState';
import ContactReview from './components/ContactReview';
import SaveState from './components/SaveState';
import SuccessState from './components/SuccessState';
import Dashboard from './components/Dashboard';
import { fetchConfigStatus, scanCard, saveContact } from './services/api';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [configStatus, setConfigStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  
  // Navigation tab: 'scan' | 'dashboard'
  const [currentTab, setCurrentTab] = useState('scan');

  // App flow steps: 'idle' | 'processing' | 'review' | 'saving' | 'success'
  const [step, setStep] = useState('idle');
  const [scanData, setScanData] = useState(null);
  const [savedContact, setSavedContact] = useState(null);
  const [error, setError] = useState(null);

  const loadStatus = async () => {
    const status = await fetchConfigStatus();
    setConfigStatus(status);
  };

  useEffect(() => {
    loadStatus();
  }, []);

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
      const result = await saveContact(formData);
      setSavedContact(formData);
      setStep('success');
      // Refresh status to update live contact count
      loadStatus();
    } catch (err) {
      console.error('Save contact error:', err);
      setError(err.message || "We extracted the contact successfully, but couldn't save it.");
      setStep('review');
    }
  };

  const handleReset = () => {
    handleClearFile();
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'scan' && step === 'success') {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Header 
        status={configStatus} 
        currentTab={currentTab} 
        onTabChange={handleTabChange} 
        onRefresh={loadStatus} 
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Error notification banner */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Processing Notice</p>
                <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View switching logic */}
        {currentTab === 'dashboard' ? (
          <Dashboard onScanNew={() => handleTabChange('scan')} />
        ) : (
          <>
            {step === 'idle' && (
              <Scanner
                onSelectFile={handleSelectFile}
                onOpenCamera={() => setCameraOpen(true)}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onClearFile={handleClearFile}
                onStartScan={handleStartScan}
                googleSheetsConfigured={configStatus?.google_sheets_configured}
              />
            )}

            {step === 'processing' && <ProcessingState />}

            {step === 'review' && (
              <ContactReview
                scanData={scanData}
                onSave={handleSaveContact}
                onCancel={handleReset}
              />
            )}

            {step === 'saving' && <SaveState />}

            {step === 'success' && (
              <SuccessState
                savedContact={savedContact}
                spreadsheetId={configStatus?.spreadsheet_id}
                totalCount={configStatus?.contact_count}
                onScanAnother={handleReset}
              />
            )}
          </>
        )}

        {/* Live Camera Modal */}
        {cameraOpen && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setCameraOpen(false)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>CardSnap Business Card Scanner — Continuous Contact Storage & Analytics</p>
      </footer>
    </div>
  );
}

