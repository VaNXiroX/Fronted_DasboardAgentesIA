import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Edit2, Plus, X } from 'lucide-react';
import { getAllAgents } from '../api/agents';
import { getClients } from '../api/clients';
import { AgentModelBadge } from '../components/ui/AgentModelBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AgentFormModal } from '../components/agents/AgentFormModal';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/skeleton';
import { useRefresh } from '../components/layout/Layout';

const STATUS_FILTERS = [
  { value: 'all',      label: 'Todos' },
  { value: 'active',   label: 'Activos' },
  { value: 'testing',  label: 'En pruebas' },
  { value: 'inactive', label: 'Inactivos' },
];

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [editingAgent, setEditingAgent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // New agent creation flow
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { refreshKey } = useRefresh();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [all, cls] = await Promise.all([getAllAgents(), getClients()]);
      setAgents(all);
      setClients(cls);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [refreshKey]);

  const filtered = agents.filter((a) => {
    const byStatus = statusFilter === 'all' || a.status === statusFilter;
    const byClient = clientFilter === 'all' || String(a.client_id) === String(clientFilter);
    return byStatus && byClient;
  });

  // Stats
  const totalCount = agents.length;
  const activeCount = agents.filter((a) => a.status === 'active').length;
  const testingCount = agents.filter((a) => a.status === 'testing').length;
  const inactiveCount = agents.filter((a) => a.status === 'inactive').length;

  const handleAddAgentClick = () => {
    setSelectedClientId(clients.length > 0 ? String(clients[0].id) : '');
    setShowClientPicker(true);
  };

  const handleClientPickerConfirm = () => {
    if (!selectedClientId) return;
    setShowClientPicker(false);
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display tracking-wide text-white">AGENTES</h1>
          <p className="text-slate-400 text-sm mt-0.5">Todos los agentes desplegados en la plataforma</p>
        </div>
        <button
          onClick={handleAddAgentClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Añadir agente
        </button>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total agentes', value: totalCount },
          { label: 'Activos', value: activeCount, cls: 'text-emerald-400' },
          { label: 'En pruebas', value: testingCount, cls: 'text-amber-400' },
          { label: 'Inactivos', value: inactiveCount },
        ].map(({ label, value, cls }) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm">
            <span className="text-slate-400">{label}</span>
            <span className={`font-bold ${cls ?? 'text-white'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status filter */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Client filter */}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todos los clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Bot} title="No hay agentes" description="No se encontraron agentes con los filtros seleccionados" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Modelo</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Workflow ID</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={`${a.client_id}-${a.id}`}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/clients/${a.client_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-amber-400 hover:underline text-sm"
                      >
                        {a.client_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{a.type ?? '—'}</td>
                    <td className="px-4 py-3"><AgentModelBadge model={a.model} /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">{a.workflow_id || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setEditingAgent(a); setShowModal(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Editar agente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AgentFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchAll}
        clientId={editingAgent?.client_id}
        initial={editingAgent}
      />

      {/* Create modal */}
      <AgentFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchAll}
        clientId={selectedClientId ? Number(selectedClientId) : null}
        initial={null}
      />

      {/* Client picker dialog */}
      {showClientPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setShowClientPicker(false)}
          />
          {/* Dialog */}
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Añadir agente</h2>
                <p className="text-slate-400 text-xs mt-0.5">Selecciona el cliente al que pertenece el agente</p>
              </div>
              <button
                onClick={() => setShowClientPicker(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Cliente <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
              >
                {clients.length === 0 && (
                  <option value="">No hay clientes disponibles</option>
                )}
                {clients.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClientPicker(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleClientPickerConfirm}
                disabled={!selectedClientId}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
