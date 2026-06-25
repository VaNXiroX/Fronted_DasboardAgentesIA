import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Agents } from "../lib/api";
import { StatusBadge } from "./StatusBadge";
import { AgentActions } from "./AgentActions";
import { fmtNum, fmtUSD, fmtMs, fmtPct, fmtDateTime } from "../lib/format";
import { TokenUsageChart } from "./charts/TokenUsageChart";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const AgentDetailSheet = ({ agentId, open, onOpenChange, onEdit, onDeleted, onAgentUpdated }) => {
  const [agent, setAgent] = useState(null);
  const [series, setSeries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!agentId || !open) return;
    setLoading(true);
    Promise.all([
      Agents.get(agentId),
      Agents.timeseries(agentId, 30),
      Agents.logs(agentId, 15),
    ])
      .then(([a, ts, lg]) => {
        setAgent(a);
        setSeries(ts);
        setLogs(lg);
      })
      .finally(() => setLoading(false));
  }, [agentId, open]);

  const tokensTotal = series.reduce((acc, d) => acc + (d.tokens || 0), 0);
  const costTotal   = series.reduce((acc, d) => acc + (d.cost || 0), 0);
  const runsTotal   = series.reduce((acc, d) => acc + (d.runs || 0), 0);
  const latencyAvg  = series.length
    ? Math.round(series.reduce((acc, d) => acc + (d.avg_latency_ms || 0), 0) / series.length)
    : 0;

  const handleDelete = async () => {
    if (!agent) return;
    if (!window.confirm(`¿Eliminar el agente "${agent.name}"?`)) return;
    await Agents.remove(agent.id);
    toast.success(`Agente "${agent.name}" eliminado`);
    onDeleted?.(agent.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        data-testid="agent-detail-sheet"
        className="w-full sm:max-w-2xl bg-zinc-950 border-l border-zinc-800 text-zinc-100 overflow-y-auto"
      >
        {loading || !agent ? (
          <div className="p-6 text-zinc-500 font-mono text-xs">Cargando agente…</div>
        ) : (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <StatusBadge status={agent.status} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                  {agent.model}
                </span>
              </div>
              <SheetTitle className="font-display text-2xl tracking-tight text-white">
                {agent.name}
              </SheetTitle>
              <p className="text-sm text-zinc-400">{agent.description || "Sin descripción."}</p>
            </SheetHeader>

            <div className="mt-5 flex items-center gap-2">
              <AgentActions agent={agent} onUpdated={(u) => { setAgent(u); onAgentUpdated?.(u); }} />
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(agent)}
                data-testid="agent-detail-edit"
                className="text-zinc-300 border border-zinc-800 hover:bg-zinc-900"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                data-testid="agent-detail-delete"
                className="text-red-400 border border-zinc-800 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Eliminar
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { label: "Tokens (30d)",   value: fmtNum(tokensTotal) },
                { label: "Costo (30d)",    value: fmtUSD(costTotal) },
                { label: "Ejecuciones",    value: fmtNum(runsTotal) },
                { label: "Latencia prom.", value: fmtMs(latencyAvg) },
              ].map((m) => (
                <div key={m.label} className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                  <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">{m.label}</div>
                  <div className="mt-1.5 font-mono text-base text-white">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Uso de tokens — últimos 30 días
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
                <TokenUsageChart data={series} height={200} />
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Configuración
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 text-xs">
                <Row k="Modelo"       v={agent.model} />
                <Row k="Temperatura"  v={agent.temperature} />
                <Row k="Máx. tokens"  v={agent.max_tokens} />
                <Row k="Etiquetas"    v={(agent.tags || []).join(", ") || "—"} />
                <div>
                  <div className="text-zinc-500 mb-1">Prompt de sistema</div>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 rounded p-3">
{agent.system_prompt}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 mb-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Actividad reciente
              </div>
              <div className="rounded-md border border-zinc-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-900/60 text-zinc-500 font-mono">
                    <tr>
                      <th className="text-left py-2 px-3 font-normal">Hora</th>
                      <th className="text-right py-2 px-3 font-normal">Tokens</th>
                      <th className="text-right py-2 px-3 font-normal">Latencia</th>
                      <th className="text-right py-2 px-3 font-normal">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-t border-zinc-800/60 hover:bg-zinc-900/40">
                        <td className="py-2 px-3 text-zinc-400 font-mono">{fmtDateTime(l.timestamp)}</td>
                        <td className="py-2 px-3 text-right text-zinc-200 font-mono">{fmtNum(l.tokens_in + l.tokens_out)}</td>
                        <td className="py-2 px-3 text-right text-zinc-200 font-mono">{fmtMs(l.latency_ms)}</td>
                        <td className="py-2 px-3 text-right">
                          {l.success
                            ? <span className="text-emerald-400 font-mono">OK</span>
                            : <span className="text-red-400 font-mono">ERR</span>}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-zinc-500 font-mono text-xs">
                          Sin actividad aún
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Row = ({ k, v }) => (
  <div className="flex items-center justify-between">
    <span className="text-zinc-500">{k}</span>
    <span className="font-mono text-zinc-200">{String(v ?? "—")}</span>
  </div>
);
