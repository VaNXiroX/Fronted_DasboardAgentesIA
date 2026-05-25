import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Plus, Trash2, CreditCard, FileText, Bot
} from 'lucide-react';
import { getClient } from '../api/clients';
import { getClientAgents } from '../api/agents';
import { getBilling, deletePayment } from '../api/payments';
import { KpiCard } from '../components/ui/KpiCard';
import { BillingBadge } from '../components/ui/BillingBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AgentModelBadge } from '../components/ui/AgentModelBadge';
import { PaymentCalendar } from '../components/billing/PaymentCalendar';
import { PaymentsTable } from '../components/billing/PaymentsTable';
import { RegisterPaymentModal } from '../components/billing/RegisterPaymentModal';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { AgentFormModal } from '../components/agents/AgentFormModal';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useToast } from '../lib/toast';
import { useRefresh } from '../components/layout/Layout';
import { formatMXN, formatDateShort, formatSinceDate } from '../lib/format';

const TABS = [
  { id: 'resumen',     label: 'Resumen',     icon: FileText },
  { id: 'facturacion', label: 'Facturación', icon: CreditCard },
];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshKey, setClientName } = useRefresh();

  const [activeTab, setActiveTab] = useState('resumen');
  const [client, setClient] = useState(null);
  const [agents, setAgents] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, ag, bi] = await Promise.all([
        getClient(id),
        getClientAgents(id),
        getBilling(id),
      ]);
      setClient(c);
      setAgents(ag);
      setBilling(bi);
      setClientName?.(c.name);
    } catch {
      toast.error('Error al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshKey]);

  // Delete payment with optimistic update
  const handleDeletePayment = async (payment) => {
    if (!window.confirm(`¿Eliminar el pago de ${payment.period_month}?`)) return;
    const prev = billing;
    // Optimistic
    setBilling((b) => b ? {
      ...b,
      payments: b.payments.filter((p) => p.id !== payment.id),
      paid_periods: b.paid_periods.filter((pp) => pp !== payment.period_month),
      missing_periods: [...(b.missing_periods ?? []), payment.period_month],
    } : b);
    try {
      await deletePayment(id, payment.id);
      toast.success('Pago eliminado');
      fetchAll(); // refresh real data
    } catch {
      setBilling(prev); // rollback
      toast.error('Error al eliminar el pago');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-1/3 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (!client) {
    return <EmptyState icon={Bot} title="Cliente no encontrado" description="El cliente solicitado no existe" />;
  }

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{client.name}</h1>
              {billing && <BillingBadge status={billing.billing_status} monthsOwed={billing.months_owed} />}
              <StatusBadge status={client.status} />
            </div>
            <p className="text-slate-500 text-sm">{formatSinceDate(client.start_date)}</p>
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors text-sm"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setActiveTab(tid)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tid
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Resumen */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Client info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Información del cliente</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Nombre" value={client.name} />
              <InfoRow label="Plan" value={billing?.plan_name ?? 'Sin plan'} />
              <InfoRow label="Estado" value={<StatusBadge status={client.status} />} />
              <InfoRow label="Inicio" value={formatDateShort(client.start_date)} />
              {client.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-400 mb-1">Notas</dt>
                  <dd className="text-slate-300 whitespace-pre-wrap">{client.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Agents mini-table */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">Agentes</h2>
              <button
                onClick={() => { setEditingAgent(null); setShowAgentForm(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar agente
              </button>
            </div>
            {agents.length === 0 ? (
              <EmptyState icon={Bot} title="Este cliente no tiene agentes" description="Agrega el primer agente" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Nombre</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Tipo</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Modelo</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Estado</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Workflow ID</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((a) => (
                      <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                        <td className="px-4 py-3 text-slate-400 capitalize">{a.type ?? '—'}</td>
                        <td className="px-4 py-3"><AgentModelBadge model={a.model} /></td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 font-mono text-slate-500 text-xs">{a.workflow_id || '—'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setEditingAgent(a); setShowAgentForm(true); }}
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
        </div>
      )}

      {/* Tab: Facturación */}
      {activeTab === 'facturacion' && billing && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={FileText} label="Meses activo" value={billing.months_active} accent="slate" />
            <KpiCard icon={FileText} label="Meses pagados" value={billing.months_paid} accent="emerald" />
            <KpiCard
              icon={FileText}
              label="Meses adeudados"
              value={billing.months_owed}
              accent={billing.months_owed > 0 ? 'red' : 'emerald'}
            />
            <KpiCard
              icon={CreditCard}
              label="Total adeudado"
              value={
                <span className={billing.total_owed_mxn > 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {formatMXN(billing.total_owed_mxn)}
                </span>
              }
              accent={billing.total_owed_mxn > 0 ? 'red' : 'emerald'}
            />
          </div>

          {/* Payment calendar */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Calendario de pagos</h2>
            <PaymentCalendar
              startDate={client.start_date}
              paidPeriods={billing.paid_periods}
              missingPeriods={billing.missing_periods}
              payments={billing.payments}
            />
          </div>

          {/* Payments table */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">Historial de pagos</h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar pago
              </button>
            </div>
            <div className="p-4">
              <PaymentsTable
                payments={billing.payments}
                onDelete={handleDeletePayment}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ClientFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={fetchAll}
        initial={client}
      />
      <AgentFormModal
        open={showAgentForm}
        onClose={() => setShowAgentForm(false)}
        onSuccess={fetchAll}
        clientId={Number(id)}
        initial={editingAgent}
      />
      {showPaymentModal && (
        <RegisterPaymentModal
          clientId={Number(id)}
          monthlyFee={billing?.monthly_fee}
          onSuccess={fetchAll}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-slate-400 text-xs mb-0.5">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}
