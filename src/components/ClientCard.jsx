import React from "react";
import { Link } from "react-router-dom";
import { Mail, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { fmtDate, fmtUSD, STATUS_COLORS } from "../lib/format";

const PLAN_COLORS = {
  Starter:    "border-zinc-700 text-zinc-300 bg-zinc-900/60",
  Pro:        "border-sky-500/30 text-sky-300 bg-sky-500/5",
  Business:   "border-amber-500/30 text-amber-300 bg-amber-500/5",
  Enterprise: "border-emerald-500/30 text-emerald-300 bg-emerald-500/5",
};

export const ClientCard = ({ client }) => {
  const s = STATUS_COLORS[client.status] || STATUS_COLORS.inactive;
  const planClass = PLAN_COLORS[client.plan] || PLAN_COLORS.Starter;
  const initials = client.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <article
      data-testid={`client-card-${client.id}`}
      className="group rounded-md border border-zinc-800 bg-zinc-900/40 p-5 transition-colors duration-150 hover:border-zinc-700"
    >
      <header className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-md border border-zinc-800 bg-zinc-950 grid place-items-center font-mono text-xs text-zinc-200">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-medium text-white truncate">
            {client.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
            <Mail className="h-3 w-3" strokeWidth={1.6} />
            <span className="truncate font-mono">{client.email}</span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-zinc-800 bg-zinc-950 text-[10px] font-mono uppercase tracking-wider ${s.text}`}
          data-testid={`client-status-${client.status}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${client.status === "active" ? "pulse-dot" : ""}`} />
          {s.label}
        </span>
      </header>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-[0.15em] ${planClass}`}>
          {client.plan}
        </span>
        <div className="text-right">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center justify-end gap-1">
            <DollarSign className="h-2.5 w-2.5" /> MRR
          </div>
          <div className="font-mono text-lg text-white">
            {client.status === "active" ? fmtUSD(client.mrr_usd) : "—"}
          </div>
        </div>
      </div>

      <footer className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Calendar className="h-3 w-3" strokeWidth={1.6} />
          <span className="font-mono">Miembro desde {fmtDate(client.signup_date)}</span>
        </div>
        <Link
          to={`/portal/${client.id}`}
          data-testid={`client-portal-link-${client.id}`}
          className="inline-flex items-center gap-1 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-md px-2 py-1 transition-colors font-mono text-[10px] uppercase tracking-wider"
        >
          Ver portal <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </footer>
    </article>
  );
};
