import React, { useMemo } from 'react';
import { generateMonthRange, formatMonthLabel, currentYearMonth } from '../../lib/format';

export function PaymentCalendar({ startDate, paidPeriods = [], missingPeriods = [], payments = [] }) {
  const months = useMemo(() => generateMonthRange(startDate), [startDate]);
  const current = currentYearMonth();

  // Build a map from period -> payment for tooltip
  const paymentMap = useMemo(() => {
    const map = {};
    payments.forEach((p) => {
      if (!map[p.period_month]) map[p.period_month] = p;
    });
    return map;
  }, [payments]);

  // Group by year
  const byYear = useMemo(() => {
    const groups = {};
    months.forEach((ym) => {
      const year = ym.slice(0, 4);
      if (!groups[year]) groups[year] = [];
      groups[year].push(ym);
    });
    return groups;
  }, [months]);

  if (!startDate || months.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-8">
        Sin fecha de inicio definida
      </div>
    );
  }

  const getCellStyle = (ym) => {
    if (paidPeriods.includes(ym)) {
      return {
        cls: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        icon: '✓',
        iconCls: 'text-emerald-400',
      };
    }
    if (missingPeriods.includes(ym)) {
      return {
        cls: 'bg-red-500/20 border-red-500/40 text-red-300',
        icon: '✕',
        iconCls: 'text-red-400',
      };
    }
    if (ym > current) {
      return {
        cls: 'bg-slate-700/30 border-slate-700 text-slate-600',
        icon: '·',
        iconCls: 'text-slate-600',
      };
    }
    return {
      cls: 'bg-slate-700/50 border-slate-600 text-slate-400',
      icon: '·',
      iconCls: 'text-slate-500',
    };
  };

  return (
    <div className="space-y-5">
      {Object.entries(byYear).map(([year, yearMonths]) => (
        <div key={year}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{year}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {yearMonths.map((ym) => {
              const { cls, icon, iconCls } = getCellStyle(ym);
              const pay = paymentMap[ym];
              const label = formatMonthLabel(ym);
              return (
                <div
                  key={ym}
                  title={
                    pay
                      ? `${label}\nPagado: $${pay.amount_mxn} MXN\nFecha: ${pay.paid_at}`
                      : missingPeriods.includes(ym)
                      ? `${label} — Sin pago`
                      : label
                  }
                  className={`relative flex flex-col items-center justify-center rounded-lg border p-2 cursor-default select-none transition-opacity hover:opacity-90 ${cls}`}
                  style={{ minHeight: '60px' }}
                >
                  <span className={`text-lg font-bold leading-none ${iconCls}`}>{icon}</span>
                  <span className="text-[10px] mt-1 font-medium opacity-80">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
