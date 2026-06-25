import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, DollarSign, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { BillingBadge } from '../components/ui/BillingBadge';
import { ClientsTable } from '../components/clients/ClientsTable';
import { SkeletonTable } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useClientsOverview } from '../hooks/useClientsOverview';
import { useRefresh } from '../components/layout/Layout';
import { formatMXN, formatDateShort } from '../lib/format';

export default function Dashboard() {
  const { data, loading, refetch } = useClientsOverview();
  const { refreshKey } = useRefresh();

  useEffect(() => {
    refetch();
  }, [refreshKey]);

  // Derived KPIs
  const total = data.length;
  const active = data.filter((c) => c.status === 'active').length;
  const allAgents = data.flatMap((c) => c.agents ?? []);
  const activeAgents = allAgents.filter((a) => a.status === 'active').length;
  const totalOwed = data.reduce((sum, c) => sum + (c.billing?.total_owed_mxn ?? 0), 0);
  const debtors = data.filter(
    (c) => c.billing?.billing_status === 'overdue' || c.billing?.billing_status === 'critical'
  ).length;

  // Alerts: critical first, then overdue
  const alertClients = [...data]
    .filter((c) => ['overdue', 'critical'].includes(c.billing?.billing_status))
    .sort((a, b) => {
      const p = { critical: 0, overdue: 1 };
      return (p[a.billing?.billing_status] ?? 2) - (p[b.billing?.billing_status] ?? 2);
    });

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Clientes activos"
          value={loading ? '—' : `${active} / ${total}`}
          accent="emerald"
          loading={loading}
        />
        <KpiCard
          icon={Bot}
          label="Agentes activos"
          value={loading ? '—' : activeAgents}
          accent="amber"
          loading={loading}
        />
        <KpiCard
          icon={totalOwed > 0 ? AlertCircle : DollarSign}
          label="Total adeudado"
          value={
            loading ? '—' : (
              <span className={totalOwed > 0 ? 'text-red-400' : 'text-emerald-400'}>
                {formatMXN(totalOwed)}
              </span>
            )
          }
          accent={totalOwed > 0 ? 'red' : 'emerald'}
          loading={loading}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Clientes con deuda"
          value={loading ? '—' : debtors}
          accent={debtors > 0 ? 'red' : 'emerald'}
          loading={loading}
        />
      </div>

      {/* Main grid: table (2/3) + alerts (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-white font-semibold">Resumen de clientes</h2>
            <p className="text-slate-500 text-xs mt-0.5">Deudores al frente</p>
          </div>
          <div className="p-4">
            {loading ? (
              <SkeletonTable rows={5} />
            ) : data.length === 0 ? (
              <EmptyState icon={Users} title="No hay clientes todavía" />
            ) : (
              <ClientsTable clients={data} />
            )}
          </div>
        </div>

        {/* Alerts panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-white font-semibold">Alertas recientes</h2>
            <p className="text-slate-500 text-xs mt-0.5">Clientes con adeudos</p>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-14 rounded-lg" />
                ))}
              </div>
            ) : alertClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
                <p className="text-emerald-400 font-semibold text-sm">Todos al corriente</p>
                <p className="text-slate-500 text-xs mt-1">Sin clientes con adeudos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alertClients.map((c) => {
                  const bill = c.billing;
                  const isCritical = bill?.billing_status === 'critical';
                  return (
                    <AlertRow key={c.id} client={c} bill={bill} isCritical={isCritical} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ client, bill, isCritical }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/clients/${client.id}`)}
      className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 hover:bg-slate-700/40 transition-colors cursor-pointer"
    >
      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${isCritical ? 'bg-red-400' : 'bg-amber-400'}`} />
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-medium truncate">{client.name}</p>
        <p className={`text-xs mt-0.5 ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
          {bill?.months_owed ?? 0} meses adeudados
          {bill?.days_since_payment != null && ` · ${bill.days_since_payment} días sin pagar`}
        </p>
      </div>
    </div>
  );
}
