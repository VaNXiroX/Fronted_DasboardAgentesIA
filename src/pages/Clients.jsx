import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { ClientCard } from '../components/clients/ClientCard';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useClientsOverview } from '../hooks/useClientsOverview';
import { useRefresh } from '../components/layout/Layout';
import { formatMXN } from '../lib/format';

const FILTERS = [
  { value: 'all',      label: 'Todos' },
  { value: 'active',   label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

export default function Clients() {
  const { data, loading, refetch } = useClientsOverview();
  const { refreshKey } = useRefresh();
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    refetch();
  }, [refreshKey]);

  const filtered = filter === 'all'
    ? data
    : data.filter((c) => c.status === filter);

  const totalClients = data.length;
  const activeCount = data.filter((c) => c.status === 'active').length;
  const inactiveCount = data.filter((c) => c.status === 'inactive').length;
  const mrr = data
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + (c.billing?.monthly_fee ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats chips */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Total clientes" value={totalClients} />
        <StatChip label="Activos" value={activeCount} />
        <StatChip label="Inactivos" value={inactiveCount} />
        <StatChip label="MRR Total" value={formatMXN(mrr)} accent />
      </div>

      {/* Filters + button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Segmented control */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay clientes"
          description={filter !== 'all' ? `No hay clientes ${filter === 'active' ? 'activos' : 'inactivos'}` : 'No hay clientes todavía'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <ClientFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={refetch}
      />
    </div>
  );
}

function StatChip({ label, value, accent = false }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${
      accent
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        : 'bg-slate-800 border-slate-700 text-slate-300'
    }`}>
      <span className="text-slate-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
