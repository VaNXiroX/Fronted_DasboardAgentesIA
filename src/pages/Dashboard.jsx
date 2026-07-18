import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, DollarSign, AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { BillingBadge } from '../components/ui/BillingBadge';
import { ClientsTable } from '../components/clients/ClientsTable';
import { SkeletonTable } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useClientsOverview } from '../hooks/useClientsOverview';
import { useBillingMonth } from '../hooks/useBillingMonth';
import { useMetricsMrr } from '../hooks/useMetricsMrr';
import { useRefresh } from '../components/layout/Layout';
import { formatMXN, formatDateShort } from '../lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data, loading, refetch: refetchClients } = useClientsOverview();
  const { data: billingData, loading: loadingBilling, refetch: refetchBilling } = useBillingMonth();
  const { data: mrrData, loading: loadingMrr, refetch: refetchMrr } = useMetricsMrr();
  const { refreshKey } = useRefresh();

  useEffect(() => {
    refetchClients();
    refetchBilling();
    refetchMrr();
  }, [refreshKey, refetchClients, refetchBilling, refetchMrr]);

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

      {/* Cobranza del mes */}
      <BillingMonthPanel loading={loadingBilling} data={billingData} />

      {/* MRR Chart */}
      <MrrChartPanel loading={loadingMrr} data={mrrData} />

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
          {bill?.overdue_since && ` · Desde ${formatDateShort(bill.overdue_since)}`}
        </p>
      </div>
    </div>
  );
}

function BillingMonthPanel({ loading, data }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="h-6 w-48 bg-slate-700 rounded animate-pulse mb-4"></div>
        <div className="h-2 w-full bg-slate-700 rounded-full animate-pulse mb-6"></div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-700 rounded-full animate-pulse"></div>
          <div className="h-8 w-24 bg-slate-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Valores por defecto seguros si la API de Angel responde diferente o falla
  const progress = data?.progress_percentage ?? 0;
  const paidClients = data?.paid ?? [];
  const pendingClients = data?.pending ?? [];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Cobranza del mes
          </h2>
          <p className="text-slate-400 text-xs mt-1">Avance de pagos esperados para este periodo</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{progress}%</span>
          <p className="text-emerald-400 text-xs font-medium">Recuperado</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Chips */}
      <div className="space-y-4">
        {/* Pagados */}
        {paidClients.length > 0 && (
          <div>
            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Pagados
            </h3>
            <div className="flex flex-wrap gap-2">
              {paidClients.map((client) => (
                <button
                  key={client.client_id}
                  onClick={() => navigate(`/clients/${client.client_id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                >
                  {client.client_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pendientes */}
        {pendingClients.length > 0 && (
          <div>
            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pendientes
            </h3>
            <div className="flex flex-wrap gap-2">
              {pendingClients.map((client) => {
                const isCritical = client.status === 'critical';
                const baseColor = isCritical ? 'red' : 'amber';
                return (
                  <button
                    key={client.client_id}
                    onClick={() => navigate(`/clients/${client.client_id}`)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-${baseColor}-500/10 border border-${baseColor}-500/20 text-${baseColor}-400 hover:bg-${baseColor}-500/20 transition-colors text-xs font-medium`}
                  >
                    <span>{client.client_name}</span>
                    <span className={`opacity-60 border-l pl-1.5 border-${baseColor}-500/30`}>
                      {formatMXN(client.amount_mxn ?? 0)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {paidClients.length === 0 && pendingClients.length === 0 && (
          <p className="text-slate-500 text-sm italic">No hay datos de cobranza para mostrar este mes.</p>
        )}
      </div>
    </div>
  );
}

function MrrChartPanel({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 h-80 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Cargando métricas...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="mb-6">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          MRR vs Cobrado Real
        </h2>
        <p className="text-slate-400 text-xs mt-1">Comparativa de los últimos 6 meses</p>
      </div>
      <div className="h-72 w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => val >= 1000 ? `$${val/1000}k` : `$${val}`} 
              />
              <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value) => formatMXN(value)}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="expected" name="Esperado" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Cobrado" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">No hay datos suficientes para la gráfica</div>
        )}
      </div>
    </div>
  );
}
