import React from 'react';
import { 
  BarChart3, Building, MapPin, Phone, Mail, Globe, Users, 
  CheckCircle2, TrendingUp, Zap, Sparkles, Activity, ShieldCheck 
} from 'lucide-react';

export default function NetworkAnalytics({ contacts }) {
  const total = contacts.length;

  // Stats calculation
  const withEmail = contacts.filter(c => Boolean(c.email)).length;
  const withPhone = contacts.filter(c => Boolean(c.phone)).length;
  const withLinkedIn = contacts.filter(c => Boolean(c.linkedin)).length;
  const withCompany = contacts.filter(c => Boolean(c.company)).length;

  const emailPct = total > 0 ? Math.round((withEmail / total) * 100) : 0;
  const phonePct = total > 0 ? Math.round((withPhone / total) * 100) : 0;
  const linkedinPct = total > 0 ? Math.round((withLinkedIn / total) * 100) : 0;
  const companyPct = total > 0 ? Math.round((withCompany / total) * 100) : 0;

  // Companies ranking
  const companyMap = {};
  contacts.forEach(c => {
    if (c.company) {
      companyMap[c.company] = (companyMap[c.company] || 0) + 1;
    }
  });

  const sortedCompanies = Object.entries(companyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sci-Fi Header Banner */}
      <div className="cyber-panel-glow rounded-3xl p-6 sm:p-8 hud-corner relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BarChart3 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase mb-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> REAL-TIME TELEMETRY ENGINE
              </div>
              <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
                Network Intelligence & Data Analytics
              </h1>
              <p className="text-xs text-slate-400">Deep telemetry and coverage metrics across your business matrix.</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-cyan-400 bg-slate-950/80 px-4 py-2 rounded-2xl border border-cyan-500/30">
            <Activity className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            <span>TELEMETRY ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Primary Sci-Fi KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="cyber-card rounded-2xl p-5 space-y-2 hud-corner">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>TOTAL MATRIX</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono text-glow-cyan">{total}</p>
          <p className="text-xs text-cyan-400 font-mono font-semibold">Scanned Contacts</p>
        </div>

        <div className="cyber-card rounded-2xl p-5 space-y-2 hud-corner">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>EMAIL COVERAGE</span>
            <Mail className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{emailPct}%</p>
          <p className="text-xs text-emerald-400 font-mono font-semibold">{withEmail} of {total} contacts</p>
        </div>

        <div className="cyber-card rounded-2xl p-5 space-y-2 hud-corner">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>PHONE REACH</span>
            <Phone className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{phonePct}%</p>
          <p className="text-xs text-sky-400 font-mono font-semibold">{withPhone} of {total} contacts</p>
        </div>

        <div className="cyber-card rounded-2xl p-5 space-y-2 hud-corner">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>LINKEDIN PROFILES</span>
            <Globe className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{linkedinPct}%</p>
          <p className="text-xs text-purple-400 font-mono font-semibold">{withLinkedIn} of {total} contacts</p>
        </div>

      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Organizations */}
        <div className="cyber-panel rounded-3xl p-6 space-y-4 border border-slate-800 hud-corner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" /> Organization Distribution
            </h3>
            <span className="text-xs font-mono text-cyan-400">{sortedCompanies.length} COMPANIES DETECTED</span>
          </div>

          <div className="space-y-3 font-sans">
            {sortedCompanies.length > 0 ? (
              sortedCompanies.map(([comp, count], idx) => (
                <div key={comp} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{comp}</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                    {count} {count === 1 ? 'record' : 'records'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-500 py-6 text-center">No organization metrics logged yet.</p>
            )}
          </div>
        </div>

        {/* Data Quality & Health */}
        <div className="cyber-panel rounded-3xl p-6 space-y-4 border border-slate-800 hud-corner">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> OCR Data Completeness Index
            </h3>
          </div>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Organization Extraction</span>
                <span className="text-cyan-400 font-bold">{companyPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${companyPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Email Extraction Rate</span>
                <span className="text-emerald-400 font-bold">{emailPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${emailPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Phone Vector Rate</span>
                <span className="text-sky-400 font-bold">{phonePct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${phonePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
