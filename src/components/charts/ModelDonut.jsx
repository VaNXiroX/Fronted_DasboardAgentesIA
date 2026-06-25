import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fmtNum } from "../../lib/format";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ea580c", "#06b6d4", "#fafafa", "#a78bfa", "#f43f5e"];

const TooltipBox = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/95 backdrop-blur px-3 py-2 shadow-2xl">
      <div className="text-xs font-mono text-white">{p.payload.model}</div>
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mt-1">tokens</div>
      <div className="text-xs font-mono text-zinc-200">{fmtNum(p.value)}</div>
    </div>
  );
};

export const ModelDonut = ({ data, height = 240 }) => {
  const total = data.reduce((acc, d) => acc + (d.tokens || 0), 0);
  return (
    <div className="flex items-center gap-6">
      <div style={{ width: 200, height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="tokens"
              nameKey="model"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={1.5}
              stroke="#09090b"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipBox />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {data.map((d, i) => {
          const pct = total ? ((d.tokens / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={d.model} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-zinc-300 truncate flex-1 font-mono">{d.model}</span>
              <span className="text-xs text-zinc-500 font-mono">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
