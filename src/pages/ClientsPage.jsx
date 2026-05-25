import React, { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Clients } from "../lib/api";
import { ClientCard } from "../components/ClientCard";
import { Input } from "../components/ui/input";
import { fmtUSD } from "../lib/format";

const FILTERS = [
  { id: "all",      label: "Todos"    },
  { id: "active",   label: "Activos"  },
  { id: "inactive", label: "Inactivos" },
];

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Clients.list()
      .then((data) => setClients(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [clients, filter, query]);

  const totals = useMemo(() => {
    const active = clients.filter((c) => c.status === "active");
    const mrr = active.reduce((acc, c) => acc + (c.mrr_usd || 0), 0);
    return {
      total: clients.length,
      active: active.length,
      inactive: clients.length - active.length,
      mrr,
    };
  }, [clients]);

  return (
    <div className="space-y-8 fade-up">
      {/* Cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Clientes / Directorio
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
            Clientes
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {filtered.length} de {totals.total} clientes
          </p>
        </div>
      </div>

      {/* Mini estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Total"       value={totals.total}       testid="clients-total"    />
        <MiniStat label="Activos"     value={totals.active}      accent="text-emerald-400" testid="clients-active"   />
        <MiniStat label="Inactivos"   value={totals.inactive}    accent="text-zinc-400"    testid="clients-inactive" />
        <MiniStat label="MRR Total"   value={fmtUSD(totals.mrr)}                           testid="clients-mrr"      />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            data-testid="clients-search"
            className="pl-9 bg-zinc-950 border-zinc-800"
          />
        </div>

        <div className="inline-flex rounded-md border border-zinc-800 overflow-hidden">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              data-testid={`clients-filter-${f.id}`}
              className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                filter === f.id
                  ? "bg-white text-zinc-950"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla */}
      {loading ? (
        <div className="text-zinc-500 font-mono text-xs">Cargando clientes…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/30 p-12 grid place-items-center text-center">
          <Users className="h-6 w-6 text-zinc-600 mb-2" strokeWidth={1.4} />
          <div className="text-sm text-zinc-300">Ningún cliente coincide con los filtros actuales</div>
          <div className="text-xs text-zinc-500 mt-1">Prueba cambiando el estado o el término de búsqueda.</div>
        </div>
      ) : (
        <div
          data-testid="clients-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
        >
          {filtered.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      )}
    </div>
  );
}

const MiniStat = ({ label, value, accent = "text-white", testid }) => (
  <div
    data-testid={testid}
    className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4"
  >
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">{label}</div>
    <div className={`mt-2 font-mono text-2xl ${accent}`}>{value}</div>
  </div>
);
