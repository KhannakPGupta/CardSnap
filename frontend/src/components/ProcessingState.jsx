import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Cpu, Radio, Sparkles } from 'lucide-react';

export default function ProcessingState() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Card Vector Ingestion Received',
    'Executing Neural Tesseract OCR Pipeline',
    'Parsing Contact Entities & Phone/Email Patterns',
    'Synthesizing Structured Contact Record'
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
    <div className="max-w-md mx-auto my-8 cyber-panel-glow rounded-3xl p-8 text-center space-y-6 hud-corner">
      
      {/* Animated Sci-Fi Radar Scanner */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-radar"></div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/30">
          <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-spin" /> OCR AI PIPELINE ACTIVE
        </div>
        <h3 className="text-2xl font-extrabold text-white font-heading tracking-tight">Processing Visual Document</h3>
        <p className="text-xs text-slate-400 font-mono">NEURAL EXTRACTOR EXECUTING IN REAL-TIME</p>
      </div>

      {/* Progress HUD Steps */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left space-y-3 font-mono text-xs">
        {steps.map((stepName, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0"></div>
              )}

              <span className={`font-medium ${
                isDone
                  ? 'text-emerald-300'
                  : isCurrent
                  ? 'text-cyan-300 font-bold text-glow-cyan'
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
