import React from "react";

export const KpiCard = ({ label, value, unit, hint, icon: Icon, accent = "text-white", testid }) => {
  return (
    <div
      data-testid={testid}
      className="group relative rounded-md border border-zinc-800 bg-zinc-900/40 p-5 transition-colors duration-150 hover:border-zinc-700"
    >
      <div className="flex items-start justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </div>
        {Icon && (
          <div className="h-7 w-7 rounded border border-zinc-800 grid place-items-center text-zinc-400">
            <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
          </div>
        )}
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <div className={`font-mono text-3xl font-medium leading-none ${accent}`}>
          {value}
        </div>
        {unit && <div className="text-xs text-zinc-500 font-mono">{unit}</div>}
      </div>
      {hint && <div className="mt-3 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
};
