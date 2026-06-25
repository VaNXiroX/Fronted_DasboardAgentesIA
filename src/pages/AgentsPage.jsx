import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Agents } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { AgentActions } from "../components/AgentActions";
import { AgentFormDialog } from "../components/AgentFormDialog";
import { AgentDetailSheet } from "../components/AgentDetailSheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { fmtDate } from "../lib/format";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const load = async () => {
    const data = await Agents.list();
    setAgents(data);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (query && !a.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [agents, status, query]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (agent) => { setEditing(agent); setFormOpen(true); };

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Flota / Todos
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white mt-1">
            Agentes
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {filtered.length} de {agents.length} agentes
          </p>
        </div>
        <Button
          onClick={openCreate}
          data-testid="create-agent-button"
          className="bg-white text-zinc-950 hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo agente
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            data-testid="agents-search"
            className="pl-9 bg-zinc-950 border-zinc-800"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger
            data-testid="agents-status-filter"
            className="w-44 bg-zinc-950 border-zinc-800"
          >
            <Filter className="h-3.5 w-3.5 mr-2 text-zinc-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="running">Activo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="stopped">Detenido</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm" data-testid="agents-table">
          <thead className="bg-zinc-900/60">
            <tr className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
              <th className="text-left px-5 py-3 font-normal">Nombre</th>
              <th className="text-left px-5 py-3 font-normal">Estado</th>
              <th className="text-left px-5 py-3 font-normal">Modelo</th>
              <th className="text-left px-5 py-3 font-normal">Etiquetas</th>
              <th className="text-left px-5 py-3 font-normal">Creado</th>
              <th className="text-right px-5 py-3 font-normal pr-5">Controles</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => setDetailId(a.id)}
                data-testid={`agent-row-${a.id}`}
                className="border-t border-zinc-800/60 hover:bg-zinc-900/40 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="text-zinc-100 font-medium">{a.name}</div>
                  <div className="text-xs text-zinc-500 truncate max-w-md">{a.description}</div>
                </td>
                <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-3 font-mono text-xs text-zinc-400">{a.model}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(a.tags || []).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-900/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-zinc-500">{fmtDate(a.created_at)}</td>
                <td className="px-5 py-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex">
                    <AgentActions agent={a} onUpdated={load} compact />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 font-mono text-xs">
                  Ningún agente coincide con los filtros actuales
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AgentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSaved={() => load()}
      />
      <AgentDetailSheet
        agentId={detailId}
        open={!!detailId}
        onOpenChange={(o) => { if (!o) setDetailId(null); }}
        onEdit={(a) => { setDetailId(null); openEdit(a); }}
        onDeleted={() => load()}
        onAgentUpdated={() => load()}
      />
    </div>
  );
}
