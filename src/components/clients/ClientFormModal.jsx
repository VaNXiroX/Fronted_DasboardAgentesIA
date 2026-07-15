import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { createClient, updateClient } from '../../api/clients';
import apiClient from '../../api/client';
import { useToast } from '../../lib/toast';
import { slugify } from '../../lib/format';

const EMPTY_FORM = {
  name: '',
  slug: '',
  plan_id: '',
  status: 'active',
  start_date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export function ClientFormModal({ open, onClose, onSuccess, initial }) {
  const toast = useToast();
  const isEdit = !!initial;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { 
              ...EMPTY_FORM, 
              ...initial, 
              start_date: initial.start_date?.slice(0, 10) ?? '',
              plan_id: initial.plan_id ?? '' 
            }
          : EMPTY_FORM
      );

      apiClient.get('/api/plans')
        .then((r) => setPlans(r.data))
        .catch(console.error);
    }
  }, [open, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const updated = { ...f, [name]: value };
      if (name === 'name' && !isEdit) updated.slug = slugify(value);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.start_date) delete payload.start_date;
      if (!payload.notes) delete payload.notes;
      if (payload.plan_id === '') payload.plan_id = null;

      if (isEdit) {
        await updateClient(initial.id, payload);
        toast.success('Cliente actualizado');
      } else {
        await createClient(payload);
        toast.success('Cliente creado');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Error al guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Nombre del cliente"
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="nombre-del-cliente"
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Plan */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan</label>
          <select
            name="plan_id"
            value={form.plan_id || ''}
            onChange={handleChange}
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          >
            <option value="">Selecciona un plan...</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - ${p.monthly_fee ?? 0}/mes
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Estado</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="paused">Pausado</option>
          </select>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Fecha de inicio</label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Notas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Notas internas..."
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-none"
          />
        </div>

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
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
