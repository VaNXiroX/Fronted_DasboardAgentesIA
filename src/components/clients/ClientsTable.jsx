import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingBadge } from '../ui/BillingBadge';
import { formatMXN, formatDateShort } from '../../lib/format';

export function ClientsTable({ clients = [], loading = false }) {
  const navigate = useNavigate();

  // Sort: critical first, then overdue, then rest
  const sorted = [...clients].sort((a, b) => {
    const priority = { critical: 0, overdue: 1, current: 2 };
    const pa = priority[a.billing?.billing_status] ?? 3;
    const pb = priority[b.billing?.billing_status] ?? 3;
    return pa - pb;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50">
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Plan</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Agentes</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Estado pago</th>
            <th className="text-right px-4 py-3 text-slate-400 font-medium">Meses adeudados</th>
            <th className="text-right px-4 py-3 text-slate-400 font-medium">Total MXN</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Última actividad</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const bill = c.billing;
            const activeAgents = (c.agents ?? []).filter((a) => a.status === 'active').length;
            const totalOwed = bill?.total_owed_mxn ?? 0;

            return (
              <tr
                key={c.id}
                onClick={() => navigate(`/clients/${c.id}`)}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 text-xs font-bold">
                        {c.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{bill?.plan_name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-300">{activeAgents}</td>
                <td className="px-4 py-3">
                  {bill ? (
                    <BillingBadge status={bill.billing_status} monthsOwed={bill.months_owed} />
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={bill?.months_owed > 0 ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                    {bill?.months_owed ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={totalOwed > 0 ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                    {formatMXN(totalOwed)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {bill?.last_paid_at ? formatDateShort(bill.last_paid_at) : 'Sin pagos'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/clients/${c.id}`); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 border border-slate-600 hover:border-amber-500/40 transition-colors"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
