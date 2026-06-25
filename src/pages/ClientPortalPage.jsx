import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, MessageSquare, Coins, DollarSign, AlertTriangle, Activity, Mail, Sparkles, Cpu } from "lucide-react";
import { Clients, Agents } from "../lib/api";
import { fmtNum, fmtUSD, fmtPct, fmtMs, fmtDate } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { AgentActions } from "../components/AgentActions";
import { TokenUsageChart } from "../components/charts/TokenUsageChart";
import { Toaster } from "../components/ui/sonner";

const PLAN_COLORS = {
  Starter:    "border-zinc-700 text-zinc-300 bg-zinc-900/60",
  Pro:        "border-sky-500/30 text-sky-300 bg-sky-500/5",
  Business:   "border-amber-500/30 text-amber-300 bg-amber-500/5",
  Enterprise: "border-emerald-500/30 text-emerald-300 bg-emerald-500/5",
};

export default function ClientPortalPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    Clients.dashboard(clientId, days)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [clientId, days]);

  const onAgentUpdated = (updated) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        agents: prev.agents.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
      };
    });
  };

  const chatbots    = useMemo(() => (data?.agents || []).filter((a) => a.agent_type === "chatbot"), [data]);
  const otherAgents = useMemo(() => (data?.agents || []).filter((a) => a.agent_type !== "chatbot"), [data]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-500 font-mono text-sm">
        Cargando portal…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-300">
        <div className="text-center">
          <div className="font-display text-2xl">Cliente no encontrado</div>
          <Link to="/clients" className="text-sm text-zinc-500 hover:text-white underline-offset-4 hover:underline mt-2 inline-block">
            ← Volver a clientes
          </Link>
        </div>
      </div>
    );
  }

  const { client, summary, timeseries } = data;
  const planClass = PLAN_COLORS[client.plan] || PLAN_COLORS.Starter;
  const initials = client.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Barra superior de admin */}
      <div className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            data-testid="portal-back-admin"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al panel de administración
          </button>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
            Portal de Cliente · Modo Vista Previa
          </span>
        </div>
      </div>

      {/* Encabezado / Hero */}
      <section className="border-b border-zinc-900 grid-texture">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16 fade-up">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5 min-w-0">
              <div className="h-16 w-16 rounded-md border border-zinc-800 bg-zinc-950 grid place-items-center font-mono text-lg text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-[0.15em] ${planClass}`}>
                    {client.plan}
                  </span>
                  <StatusBadge status={client.status === "active" ? "running" : "stopped"} />
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                  Bienvenido, <span className="text-zinc-400">{client.name.split(" ")[0]}</span>
                </h1>
                <p className="text-sm text-zinc-400 mt-2 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {client.email} · Miembro desde {fmtDate(client.signup_date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-zinc-800 overflow-hidden">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    data-testid={`portal-range-${d}d`}
                    className={`px-3 py-1.5 text-xs font-mono ${
                      days === d ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <PortalKpi label="Total de tokens"  value={fmtNum(summary.total_tokens)}  icon={Coins}         testid="portal-kpi-tokens" />
            <PortalKpi label="Gasto"            value={fmtUSD(summary.total_cost_usd)} icon={DollarSign}   testid="portal-kpi-cost"   />
            <PortalKpi
              label="IAs activas"
              value={`${summary.active}/${summary.total_agents}`}
              hint={`${summary.chatbots} chatbots · ${summary.agents} agentes`}
              icon={Bot}
              accent="text-emerald-400"
              testid="portal-kpi-active"
            />
            <PortalKpi
              label="Tasa de error"
              value={fmtPct(summary.error_rate_pct)}
              hint={`Prom. ${fmtMs(summary.avg_latency_ms)}`}
              icon={AlertTriangle}
              accent={summary.error_rate_pct > 10 ? "text-red-400" : "text-white"}
              testid="portal-kpi-error"
            />
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 space-y-12">
        {/* Gráfica de uso */}
        <section className="fade-up">
          <SectionHeader
            eyebrow="Actividad"
            title="Tu uso a lo largo del tiempo"
            description="Consumo de tokens de todos tus chatbots y agentes."
          />
          <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-900/40 p-5">
            {timeseries.length === 0 ? (
              <div className="text-xs text-zinc-500 font-mono py-12 text-center">Sin actividad aún</div>
            ) : (
              <TokenUsageChart data={timeseries} height={300} />
            )}
          </div>
        </section>

        {/* Chatbots */}
        <section className="fade-up">
          <SectionHeader
            eyebrow={`${chatbots.length} chatbot${chatbots.length === 1 ? "" : "s"}`}
            title="Tus chatbots"
            description="Interfaces conversacionales de cara al cliente."
            icon={MessageSquare}
          />
          {chatbots.length === 0 ? (
            <EstadoVacio text="Sin chatbots aún. Habla con tu gestor de cuenta para activar uno." />
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {chatbots.map((a) => (
                <AICard key={a.id} agent={a} onUpdated={onAgentUpdated} kind="chatbot" />
              ))}
            </div>
          )}
        </section>

        {/* Agentes de IA */}
        <section className="fade-up">
          <SectionHeader
            eyebrow={`${otherAgents.length} agente${otherAgents.length === 1 ? "" : "s"}`}
            title="Tus agentes de IA"
            description="Trabajadores autónomos de IA ejecutándose en tu nombre."
            icon={Sparkles}
          />
          {otherAgents.length === 0 ? (
            <EstadoVacio text="Sin agentes de IA aún." />
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {otherAgents.map((a) => (
                <AICard key={a.id} agent={a} onUpdated={onAgentUpdated} kind="agent" />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-900 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
          <span>Sentinel.ai · Portal de Cliente</span>
          <span>{client.name}</span>
        </div>
      </footer>

      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

const PortalKpi = ({ label, value, hint, icon: Icon, accent = "text-white", testid }) => (
  <div data-testid={testid} className="rounded-md border border-zinc-800 bg-zinc-900/40 p-5">
    <div className="flex items-start justify-between">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <Icon className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.6} />
    </div>
    <div className={`mt-6 font-mono text-3xl ${accent}`}>{value}</div>
    {hint && <div className="mt-2 text-[11px] text-zinc-500 font-mono">{hint}</div>}
  </div>
);

const SectionHeader = ({ eyebrow, title, description, icon: Icon }) => (
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.8} />}
        {eyebrow}
      </div>
      <h2 className="font-display text-2xl font-medium tracking-tight text-white mt-1">{title}</h2>
      {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
    </div>
  </div>
);

const EstadoVacio = ({ text }) => (
  <div className="mt-5 rounded-md border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center text-xs text-zinc-500 font-mono">
    {text}
  </div>
);

const AICard = ({ agent, onUpdated, kind }) => {
  const Icon = kind === "chatbot" ? MessageSquare : Cpu;
  return (
    <div
      data-testid={`portal-ai-${agent.id}`}
      className="group rounded-md border border-zinc-800 bg-zinc-900/40 p-5 transition-colors duration-150 hover:border-zinc-700"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md border border-zinc-800 bg-zinc-950 grid place-items-center text-zinc-300">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base text-white truncate">{agent.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{agent.description || "—"}</p>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Tokens"   value={fmtNum(agent.tokens)}          />
        <Stat label="Costo"    value={fmtUSD(agent.cost)}            />
        <Stat label="Latencia" value={fmtMs(agent.avg_latency_ms)}   />
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{agent.model}</span>
        <AgentActions agent={agent} onUpdated={onUpdated} compact />
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">{label}</div>
    <div className="font-mono text-sm text-zinc-100 mt-1 truncate">{value}</div>
  </div>
);
