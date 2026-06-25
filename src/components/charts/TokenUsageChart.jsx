import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { fmtDate, fmtNum } from "../../lib/format";

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/95 backdrop-blur px-3 py-2 shadow-2xl">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-1">
        {fmtDate(label)}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-3 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-400 capitalize">{p.dataKey}</span>
          <span className="ml-auto font-mono text-white">
            {p.dataKey === "cost" ? `$${Number(p.value).toFixed(2)}` : fmtNum(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TokenUsageChart = ({ data, height = 280 }) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            stroke="#52525b"
            tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#52525b"
            tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }}
            tickFormatter={(v) => fmtNum(v)}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<TooltipBox />} cursor={{ stroke: "#3f3f46", strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="tokens"
            stroke="#2563eb"
            strokeWidth={1.75}
            fill="url(#tokenFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
