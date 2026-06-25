import React from 'react';

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 p-4 bg-slate-800 rounded-2xl border border-slate-700">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <p className="text-slate-300 font-semibold text-lg">{title}</p>
      {description && (
        <p className="text-slate-500 text-sm mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
}
