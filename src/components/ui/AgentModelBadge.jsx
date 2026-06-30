import React from 'react';

export function AgentModelBadge({ model }) {
  if (!model) return <span className="text-slate-500 text-xs">—</span>;

  let colorClass = 'bg-slate-700/60 text-slate-300 border-slate-600';
  const modelStr = String(model);

  if (modelStr.startsWith('gpt')) colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
  else if (modelStr.startsWith('claude')) colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/25';
  else if (modelStr.startsWith('gemini')) colorClass = 'bg-blue-500/15 text-blue-400 border-blue-500/25';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass} font-mono`}
    >
      {modelStr}
    </span>
  );
}
