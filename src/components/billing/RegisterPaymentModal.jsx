import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { registerPayment } from '../../api/payments';
import { useToast } from '../../lib/toast';
import { currentYearMonth } from '../../lib/format';

export function RegisterPaymentModal({ clientId, monthlyFee, onSuccess, onClose }) {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    period_month: currentYearMonth(),
    amount_mxn: monthlyFee ?? '',
    paid_at: today,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await registerPayment(clientId, {
        ...form,
        amount_mxn: Number(form.amount_mxn),
      });
      toast.success('Pago registrado correctamente');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Error al registrar el pago');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Registrar pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Período <span className="text-red-400">*</span>
          </label>
          <input
            type="month"
            name="period_month"
            value={form.period_month}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Monto MXN <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="amount_mxn"
            value={form.amount_mxn}
            onChange={handleChange}
            required
            min="0"
            placeholder="0"
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Fecha de pago */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Fecha de pago <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="paid_at"
            value={form.paid_at}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Notas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Referencia, método de pago..."
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
