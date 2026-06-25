import React, { useState } from "react";
import { Play, Pause, Square, RotateCw, Loader2 } from "lucide-react";
import { Agents } from "../lib/api";
import { toast } from "sonner";

const buttons = [
  { action: "start",   icon: Play,     label: "Iniciar",    colorIdle: "text-emerald-400 hover:bg-emerald-500/10 border-zinc-800 hover:border-emerald-500/40" },
  { action: "pause",   icon: Pause,    label: "Pausar",     colorIdle: "text-amber-400 hover:bg-amber-500/10 border-zinc-800 hover:border-amber-500/40" },
  { action: "stop",    icon: Square,   label: "Detener",    colorIdle: "text-zinc-300 hover:bg-zinc-800 border-zinc-800" },
  { action: "restart", icon: RotateCw, label: "Reiniciar",  colorIdle: "text-sky-400 hover:bg-sky-500/10 border-zinc-800 hover:border-sky-500/40" },
];

export const AgentActions = ({ agent, onUpdated, compact = false }) => {
  const [busy, setBusy] = useState(null);

  const handle = async (action) => {
    setBusy(action);
    try {
      const updated = await Agents.action(agent.id, action);
      onUpdated?.(updated);
      const labels = { start: "iniciado", pause: "pausado", stop: "detenido", restart: "reiniciado" };
      toast.success(`${agent.name}: ${labels[action] || action}`);
    } catch (e) {
      toast.error(`Acción fallida: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "gap-2"}`}>
      {buttons.map(({ action, icon: Icon, label, colorIdle }) => (
        <button
          key={action}
          onClick={(e) => { e.stopPropagation(); handle(action); }}
          disabled={busy !== null}
          data-testid={`agent-${action}-${agent.id}`}
          title={label}
          className={`inline-flex items-center justify-center h-8 w-8 rounded-md border bg-zinc-950 transition-colors duration-150 disabled:opacity-50 ${colorIdle}`}
        >
          {busy === action ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />}
        </button>
      ))}
    </div>
  );
};
