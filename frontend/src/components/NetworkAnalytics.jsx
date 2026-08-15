import React from 'react';
import { 
  BarChart3, Building, MapPin, Phone, Mail, Globe, Users, 
  CheckCircle2, TrendingUp, Zap, Sparkles 
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
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Network Insights & Analytics</h1>
            <p className="text-sm text-slate-400">Real-time statistics on your scanned business card network.</p>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Network</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{total}</p>
          <p className="text-xs text-indigo-300 font-medium">Scanned Business Contacts</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Email Coverage</span>
            <Mail className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{emailPct}%</p>
          <p className="text-xs text-emerald-300 font-medium">{withEmail} of {total} contacts</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Phone Reach</span>
            <Phone className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{phonePct}%</p>
          <p className="text-xs text-sky-300 font-medium">{withPhone} of {total} contacts</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>LinkedIn Profiles</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{linkedinPct}%</p>
          <p className="text-xs text-indigo-300 font-medium">{withLinkedIn} of {total} contacts</p>
        </div>

      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Organizations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" /> Top Organizations
            </h3>
            <span className="text-xs text-slate-400">{sortedCompanies.length} companies</span>
          </div>

          <div className="space-y-3">
            {sortedCompanies.length > 0 ? (
              sortedCompanies.map(([comp, count], idx) => (
                <div key={comp} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-white text-sm">{comp}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-bold">
                    {count} {count === 1 ? 'contact' : 'contacts'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No company data available yet.</p>
            )}
          </div>
        </div>

        {/* Data Quality & Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" /> Database Health Index
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Company Name Extraction</span>
                <span className="text-indigo-400">{companyPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${companyPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Email Address Extraction</span>
                <span className="text-emerald-400">{emailPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${emailPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Phone Number Extraction</span>
                <span className="text-sky-400">{phonePct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${phonePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
