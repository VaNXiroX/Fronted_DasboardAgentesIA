import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatMXN, formatDateShort } from '../../lib/format';
import { EmptyState } from '../ui/EmptyState';

export function PaymentsTable({ payments = [], onDelete, loading = false }) {
  if (!loading && payments.length === 0) {
    return (
      <EmptyState
        icon={Trash2}
        title="Sin pagos registrados"
        description="Registra el primer pago para este cliente"
      />
    );
  }

  const sorted = [...payments].sort((a, b) =>
    b.period_month.localeCompare(a.period_month)
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50">
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Periodo</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Monto</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Fecha de pago</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Notas</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.id}
              className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
            >
              <td className="px-4 py-3 font-mono text-slate-300">{p.period_month}</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">{formatMXN(p.amount_mxn)}</td>
              <td className="px-4 py-3 text-slate-400">{formatDateShort(p.paid_at)}</td>
              <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{p.notes || '—'}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onDelete?.(p)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Eliminar pago"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
