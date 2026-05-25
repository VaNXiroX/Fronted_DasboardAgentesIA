import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { createAgent, updateAgent } from '../../api/agents';
import { useToast } from '../../lib/toast';

const AGENT_TYPES = ['ventas', 'soporte', 'cobranza', 'general', 'asistente_personal', 'agenda'];
const AGENT_MODELS = ['gpt-4o-mini', 'gpt-4o', 'claude-sonnet-4.5', 'gemini-2.0-flash', 'gemini-1.5-pro'];
const EMPTY_FORM = {
  name: '',
  type: 'general',
  model: 'gpt-4o-mini',
  status: 'testing',
  workflow_id: '',
  chatwoot_inbox: '',
  description: '',
};

export function AgentFormModal({ open, onClose, onSuccess, clientId, initial }) {
  const toast = useToast();
  const isEdit = !!initial;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
    }
  }, [open, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.workflow_id) delete payload.workflow_id;
      if (!payload.chatwoot_inbox) delete payload.chatwoot_inbox;
      if (!payload.description) delete payload.description;

      if (isEdit) {
        await updateAgent(clientId, initial.id, payload);
        toast.success('Agente actualizado');
      } else {
        await createAgent(clientId, payload);
        toast.success('Agente creado');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Error al guardar el agente');
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = 'w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar agente' : 'Agregar agente'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input name="name" value={form.name} onChange={handleChange} required
            placeholder="Nombre del agente" className={fieldCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
            <select name="type" value={form.type} onChange={handleChange} className={fieldCls}>
              {AGENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Modelo</label>
            <select name="model" value={form.model} onChange={handleChange} className={fieldCls}>
              {AGENT_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Estado</label>
          <select name="status" value={form.status} onChange={handleChange} className={fieldCls}>
            <option value="active">Activo</option>
            <option value="testing">En pruebas</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Workflow ID */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Workflow ID</label>
            <input name="workflow_id" value={form.workflow_id} onChange={handleChange}
              placeholder="wf-abc123" className={`${fieldCls} font-mono`} />
          </div>

          {/* Chatwoot inbox */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Chatwoot Inbox</label>
            <input name="chatwoot_inbox" value={form.chatwoot_inbox} onChange={handleChange}
              placeholder="inbox-name" className={fieldCls} />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={3} placeholder="Descripción del agente..."
            className={`${fieldCls} resize-none`} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear agente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
