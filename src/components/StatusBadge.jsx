import React from "react";
import { STATUS_COLORS } from "../lib/format";

export const StatusDot = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.stopped;
  return (
    <span className={`inline-flex h-2 w-2 rounded-full ${s.dot} ${status === "running" ? "pulse-dot" : ""}`} />
  );
};

export const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.stopped;
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono uppercase tracking-wider ${s.text}`}
    >
      <StatusDot status={status} />
      {s.label}
    </span>
  );
};
