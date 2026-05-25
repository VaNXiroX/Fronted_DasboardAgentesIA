import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Clients } from "../lib/api";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "./ui/input";

const PLAN_COLORS = {
  Starter:    "border-zinc-700 text-zinc-300 bg-zinc-900/60",
  Pro:        "border-sky-500/30 text-sky-300 bg-sky-500/5",
  Business:   "border-amber-500/30 text-amber-300 bg-amber-500/5",
  Enterprise: "border-emerald-500/30 text-emerald-300 bg-emerald-500/5",
};

export const ClientPickerDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    Clients.list().then(setClients).catch(() => {});
  }, [open]);

  const filtered = clients.filter((c) => !query || c.name.toLowerCase().includes(query.toLowerCase()));

  const pick = (c) => {
    onOpenChange(false);
    navigate(`/portal/${c.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="client-picker-dialog"
        className="max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100"
      >
        <DialogHeader>
          <DialogTitle className="font-display tracking-tight">Abrir portal de cliente</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            Previsualiza lo que ve uno de tus clientes cuando inicia sesión.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente…"
            data-testid="client-picker-search"
            className="pl-9 bg-zinc-950 border-zinc-800"
            autoFocus
          />
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto rounded-md border border-zinc-800 divide-y divide-zinc-800">
          {filtered.map((c) => {
            const planClass = PLAN_COLORS[c.plan] || PLAN_COLORS.Starter;
            const initials = c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            return (
              <button
                key={c.id}
                onClick={() => pick(c)}
                data-testid={`client-picker-row-${c.id}`}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors text-left"
              >
                <div className="h-8 w-8 rounded border border-zinc-800 bg-zinc-950 grid place-items-center font-mono text-[10px] text-zinc-300">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white truncate">{c.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{c.email}</div>
                </div>
                <span className={`inline-flex px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase ${planClass}`}>
                  {c.plan}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">No se encontraron clientes</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
