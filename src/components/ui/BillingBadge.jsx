import React from 'react';

export function BillingBadge({ status, monthsOwed }) {
  if (status === 'current') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Al corriente
      </span>
    );
  }
  if (status === 'overdue') {
    const label = monthsOwed === 1 ? '1 mes' : `${monthsOwed ?? 1} mes(es)`;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {label}
      </span>
    );
  }
  if (status === 'critical') {
    const label = `${monthsOwed ?? 2} meses`;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        {label}
      </span>
    );
  }
  return <span className="text-slate-400 text-xs">—</span>;
}
