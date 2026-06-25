import React, { useEffect, useMemo, useState } from "react";
import { Coins, DollarSign, Bot, AlertTriangle, ArrowUpRight, RotateCw, ExternalLink } from "lucide-react";
import { Metrics, Agents, Admin } from "../lib/api";
import { KpiCard } from "../components/KpiCard";
import { TokenUsageChart } from "../components/charts/TokenUsageChart";
import { ModelDonut } from "../components/charts/ModelDonut";
import { StatusBadge } from "../components/StatusBadge";
import { AgentActions } from "../components/AgentActions";
import { ClientPickerDialog } from "../components/ClientPickerDialog";
import { fmtNum, fmtUSD, fmtPct, fmtMs } from "../lib/format";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [series, setSeries] = useState([]);
  const [byModel, setByModel] = useState([]);
  const [byAgent, setByAgent] = useState([]);
  const [days, setDays] = useState(30);
  const [reseeding, setReseeding] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = async () => {
    const [ov, ts, bm, ba] = await Promise.all([
      Metrics.overview(),
      Metrics.timeseries(days),
      Metrics.byModel(),
      Metrics.byAgent(),
    ]);
    setOverview(ov);
    setSeries(ts);
    setByModel(bm);
    setByAgent(ba);
  };

  useEffect(() => { load(); }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  const topAgents = useMemo(() => byAgent.slice(0, 6), [byAgent]);

  const reseed = async () => {
    setReseeding(true);
    try {
      await Admin.resetSeed();
      await load();
      toast.success("Datos de demostración regenerados");
    } catch (e) {
      toast.error("Error al regenerar datos");
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div className="space-y-8 fade-up">
      {/* Cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Resumen / Últimos {days} días
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
            Sala de control
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Observabilidad en tiempo real de todos los agentes de IA en tu espacio de trabajo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-zinc-800 overflow-hidden">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                data-testid={`range-${d}d`}
                className={`px-3 py-1.5 text-xs font-mono ${
                  days === d ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
          <Button
            onClick={() => setPickerOpen(true)}
            data-testid="open-client-portal-button"
            className="bg-white text-zinc-950 hover:bg-zinc-200"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            Ver portal cliente
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={reseed}
            disabled={reseeding}
            data-testid="reseed-button"
            className="border border-zinc-800 text-zinc-300 hover:bg-zinc-900"
          >
            <RotateCw className={`h-3.5 w-3.5 mr-1.5 ${reseeding ? "animate-spin" : ""}`} />
            Actualizar demo
          </Button>
        </div>
      </div>

      <ClientPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} />

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard
          testid="kpi-tokens"
          label="Total de tokens"
          value={overview ? fmtNum(overview.total_tokens) : "—"}
          unit="últimos 30 días"
          hint={`${overview?.total_runs ?? 0} ejecuciones totales`}
          icon={Coins}
        />
        <KpiCard
          testid="kpi-cost"
          label="Costo estimado"
          value={overview ? fmtUSD(overview.total_cost_usd) : "—"}
          unit="USD"
          hint="En todos los modelos"
          icon={DollarSign}
        />
        <KpiCard
          testid="kpi-active"
          label="Agentes activos"
          value={overview ? `${overview.active_agents}/${overview.total_agents}` : "—"}
          unit="en ejecución"
          hint={`${overview?.paused_agents ?? 0} pausados · ${overview?.error_agents ?? 0} con error`}
          icon={Bot}
          accent="text-emerald-400"
        />
        <KpiCard
          testid="kpi-error"
          label="Tasa de error"
          value={overview ? fmtPct(overview.error_rate_pct) : "—"}
          unit={`Prom. ${overview ? fmtMs(overview.avg_latency_ms) : ""}`}
          hint="Errores en todas las ejecuciones"
          icon={AlertTriangle}
          accent={overview && overview.error_rate_pct > 10 ? "text-red-400" : "text-white"}
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                Consumo de tokens
              </div>
              <h3 className="font-display text-lg font-medium text-zinc-100 mt-1">
                Uso histórico
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">total</div>
              <div className="font-mono text-2xl text-white">
                {fmtNum(series.reduce((a, b) => a + b.tokens, 0))}
              </div>
            </div>
          </div>
          <TokenUsageChart data={series} height={280} />
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                Por modelo
              </div>
              <h3 className="font-display text-lg font-medium text-zinc-100 mt-1">
                Distribución
              </h3>
            </div>
          </div>
          {byModel.length > 0 ? (
            <ModelDonut data={byModel} />
          ) : (
            <div className="text-xs text-zinc-500 font-mono py-12 text-center">Sin datos aún</div>
          )}
        </div>
      </div>

      {/* Tabla de agentes */}
      <div className="rounded-md border border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
              Principales agentes
            </div>
            <h3 className="font-display text-lg font-medium text-zinc-100 mt-1">
              Por consumo de tokens
            </h3>
          </div>
          <Link
            to="/agents"
            data-testid="dashboard-view-all-agents"
            className="text-xs font-mono text-zinc-400 hover:text-white inline-flex items-center gap-1"
          >
            Ver todos <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
              <th className="text-left px-5 py-3 font-normal">Agente</th>
              <th className="text-left px-5 py-3 font-normal">Modelo</th>
              <th className="text-left px-5 py-3 font-normal">Estado</th>
              <th className="text-right px-5 py-3 font-normal">Tokens</th>
              <th className="text-right px-5 py-3 font-normal">Costo</th>
              <th className="text-right px-5 py-3 font-normal">Latencia</th>
              <th className="text-right px-5 py-3 font-normal">Error</th>
              <th className="text-right px-5 py-3 font-normal pr-5">Controles</th>
            </tr>
          </thead>
          <tbody>
            {topAgents.map((a) => (
              <tr key={a.agent_id} className="border-t border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3 text-zinc-100">{a.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-zinc-400">{a.model}</td>
                <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-3 text-right font-mono text-zinc-100">{fmtNum(a.tokens)}</td>
                <td className="px-5 py-3 text-right font-mono text-zinc-100">{fmtUSD(a.cost)}</td>
                <td className="px-5 py-3 text-right font-mono text-zinc-300">{fmtMs(a.avg_latency_ms)}</td>
                <td className={`px-5 py-3 text-right font-mono ${a.error_rate_pct > 10 ? "text-red-400" : "text-zinc-300"}`}>
                  {fmtPct(a.error_rate_pct)}
                </td>
                <td className="px-5 py-3 pr-5 text-right">
                  <div className="inline-flex">
                    <AgentActions agent={{ id: a.agent_id, name: a.name }} onUpdated={load} compact />
                  </div>
                </td>
              </tr>
            ))}
            {topAgents.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-zinc-500 font-mono text-xs">
                  Sin agentes aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
