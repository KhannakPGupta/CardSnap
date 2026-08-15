import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export default function ProcessingState() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Image received',
    'Reading text with OCR',
    'Identifying contact details',
    'Preparing contact model'
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 600);
    const timer2 = setTimeout(() => setCurrentStep(2), 1400);
    const timer3 = setTimeout(() => setCurrentStep(3), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
      
      {/* Animated icon */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">Scanning your card</h3>
        <p className="text-sm text-slate-400">Analyzing document layout and text...</p>
      </div>

      {/* Progress steps */}
      <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 text-left space-y-3">
        {steps.map((stepName, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex items-center gap-3 text-sm">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                </span>
              ) : (
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              )}

              <span className={`font-medium ${
                isDone
                  ? 'text-emerald-300'
                  : isCurrent
                  ? 'text-indigo-300 font-semibold'
                  : 'text-slate-500'
              }`}>
                {stepName}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
