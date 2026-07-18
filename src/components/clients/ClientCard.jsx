import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingBadge } from '../ui/BillingBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { formatMXN, formatSinceDate, getInitials, formatMonthLabel } from '../../lib/format';
import { Bot, ArrowRight, Trash2 } from 'lucide-react';

export function ClientCard({ client, onDelete }) {
  const navigate = useNavigate();
  const { billing, agents = [] } = client;
  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const initials = getInitials(client.name);

  return (
    <div
      onClick={() => navigate(`/clients/${client.id}`)}
      className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-amber-500/40 hover:bg-slate-700/60 transition-all cursor-pointer group fade-up"
    >
      {/* Top: avatar + name + status dot */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
          <span className="text-slate-900 font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm truncate">{client.name}</h3>
              <StatusBadge status={client.status} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(client);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Eliminar cliente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            {billing?.plan_name ?? 'Sin plan'}
          </p>
        </div>
      </div>

      {/* Billing badge */}
      {billing && (
        <div className="mb-3">
          <BillingBadge status={billing.billing_status} monthsOwed={billing.months_owed} />
          <p className="text-xs mt-1.5 font-medium">
            {billing.billing_status === 'current' && (
              <span className="text-emerald-400">
                Vence en {billing.days_until_overdue ?? 0} días
              </span>
            )}
            {billing.billing_status === 'overdue' && (
              <span className="text-amber-400">
                Atrasado desde {billing.overdue_since ? formatMonthLabel(billing.overdue_since.substring(0, 7)) : '—'}
              </span>
            )}
            {billing.billing_status === 'critical' && (
              <span className="text-red-400">
                Atrasado desde {billing.overdue_since ? formatMonthLabel(billing.overdue_since.substring(0, 7)) : '—'} · {billing.months_owed ?? 0} meses
              </span>
            )}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="space-y-1.5 text-xs text-slate-400 mb-4">
        <div className="flex items-center justify-between">
          <span>MRR</span>
          <span className="text-white font-semibold">{formatMXN(billing?.monthly_fee ?? 0)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Inicio</span>
          <span className="text-slate-300">{formatSinceDate(client.start_date)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            Agentes
          </span>
          <span className="text-slate-300">{activeAgents} activos</span>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-600 group-hover:border-amber-500/40 group-hover:text-amber-400 text-slate-400 text-xs font-medium transition-colors">
        Ver detalle
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
