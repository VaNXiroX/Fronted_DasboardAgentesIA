import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    active:   { label: 'Activo',     cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
    testing:  { label: 'En pruebas', cls: 'bg-amber-500/15  text-amber-400  border-amber-500/25' },
    inactive: { label: 'Inactivo',   cls: 'bg-slate-700/60  text-slate-400  border-slate-600' },
    paused:   { label: 'Pausado',    cls: 'bg-blue-500/15   text-blue-400   border-blue-500/25' },
  };
  const entry = map[status] ?? map.inactive;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${entry.cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {entry.label}
    </span>
  );
}
