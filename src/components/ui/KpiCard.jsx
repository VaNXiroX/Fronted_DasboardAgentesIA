import React from 'react';

export function KpiCard({ icon: Icon, label, value, accent = 'amber', sub, loading = false }) {
  const accentMap = {
    amber:   'bg-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    red:     'bg-red-500/20 text-red-400',
    blue:    'bg-blue-500/20 text-blue-400',
    slate:   'bg-slate-700 text-slate-400',
  };
  const iconBg = accentMap[accent] ?? accentMap.amber;

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="skeleton w-10 h-10 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-1/2 rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors fade-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
