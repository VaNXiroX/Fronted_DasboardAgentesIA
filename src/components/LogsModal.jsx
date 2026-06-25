import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  RefreshCw,
  ScrollText,
  AlertTriangle,
  Info,
  XCircle,
  Filter,
} from "lucide-react";
import { getLogs } from "../api/logs";

/* ─── Nivel de badge ─────────────────────────────────────────────────────── */
const LEVEL_CONFIG = {
  INFO: {
    label: "INFO",
    icon: Info,
    cls: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  },
  WARNING: {
    label: "WARN",
    icon: AlertTriangle,
    cls: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  ERROR: {
    label: "ERROR",
    icon: XCircle,
    cls: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  },
};

function LevelBadge({ level }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.INFO;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${cfg.cls}`}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {cfg.label}
    </span>
  );
}

/* ─── Formatear timestamp ─────────────────────────────────────────────────── */
function formatTs(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

/* ─── Modal principal ────────────────────────────────────────────────────── */
export function LogsModal({ open, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLogs(100);
      setLogs(data.logs || []);
    } catch (e) {
      setError("No se pudieron cargar los logs. Verifica la conexión con el backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchLogs();
  }, [open, fetchLogs]);

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const levels = ["ALL", "INFO", "WARNING", "ERROR"];
  const filtered = logs.filter((log) => {
    const matchLevel = filter === "ALL" || log.level === filter;
    const matchSearch =
      !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.category.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const counts = {
    INFO: logs.filter((l) => l.level === "INFO").length,
    WARNING: logs.filter((l) => l.level === "WARNING").length,
    ERROR: logs.filter((l) => l.level === "ERROR").length,
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-700 grid place-items-center border border-slate-600">
              <ScrollText className="h-4 w-4 text-slate-300" strokeWidth={1.6} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Logs del Sistema</h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {logs.length} eventos · última semana
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              title="Actualizar"
              className="h-8 w-8 grid place-items-center rounded-md border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-40"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                strokeWidth={2}
              />
            </button>
            <button
              onClick={onClose}
              title="Cerrar"
              className="h-8 w-8 grid place-items-center rounded-md border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-700/60 bg-slate-800/30">
          {["INFO", "WARNING", "ERROR"].map((lvl) => {
            const cfg = LEVEL_CONFIG[lvl];
            const Icon = cfg.icon;
            return (
              <button
                key={lvl}
                onClick={() => setFilter(filter === lvl ? "ALL" : lvl)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all border ${
                  filter === lvl
                    ? cfg.cls + " scale-105"
                    : "text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="h-3 w-3" strokeWidth={2} />
                {lvl} · {counts[lvl]}
              </button>
            );
          })}
          <div className="flex-1" />
          {/* Búsqueda */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-600" />
            <input
              type="text"
              placeholder="Filtrar mensajes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 placeholder:text-slate-600 pl-7 pr-3 py-1.5 w-48 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Log list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <RefreshCw className="h-6 w-6 animate-spin mb-3" />
              <span className="text-sm font-mono">Cargando logs…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <XCircle className="h-8 w-8 text-rose-500" />
              <span className="text-sm text-rose-400 text-center px-8">{error}</span>
              <button
                onClick={fetchLogs}
                className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <ScrollText className="h-8 w-8 mb-3 opacity-40" />
              <span className="text-sm font-mono">Sin resultados para el filtro actual</span>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-800/80 backdrop-blur-sm text-slate-500 text-[10px] uppercase tracking-widest">
                  <th className="text-left px-5 py-2 font-medium w-36">Timestamp</th>
                  <th className="text-left px-3 py-2 font-medium w-20">Nivel</th>
                  <th className="text-left px-3 py-2 font-medium w-20">Categoría</th>
                  <th className="text-left px-3 py-2 font-medium">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`border-b border-slate-700/40 transition-colors hover:bg-slate-700/30 ${
                      i % 2 === 0 ? "" : "bg-slate-800/20"
                    }`}
                  >
                    <td className="px-5 py-2.5 text-slate-500 whitespace-nowrap">
                      {formatTs(log.timestamp)}
                    </td>
                    <td className="px-3 py-2.5">
                      <LevelBadge level={log.level} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 capitalize">
                      {log.category}
                    </td>
                    <td className="px-3 py-2.5 text-slate-300 leading-relaxed">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-700 bg-slate-800/40 flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-mono">
            Mostrando {filtered.length} de {logs.length} eventos
          </span>
          <span className="text-[10px] text-slate-700 font-mono">
            ESC para cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
