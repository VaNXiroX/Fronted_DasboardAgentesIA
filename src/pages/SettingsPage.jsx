import React, { useState, useEffect } from 'react';
import { Settings, Server, Shield, Database, RefreshCw, CreditCard } from 'lucide-react';
import { getPlans } from '../api/plans';
import { getHealth } from '../api/health';
import { useToast } from '../lib/toast';

// Tabs
const TABS = [
  { id: 'plans', label: 'Planes', icon: CreditCard },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'system', label: 'Sistema', icon: Server },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('plans');

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-xl">
          <Settings className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-slate-400 text-sm">Gestiona planes, seguridad y estado del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 overflow-x-auto">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setActiveTab(tid)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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

      {/* Content */}
      <div className="py-2">
        {activeTab === 'plans' && <PlansSection />}
        {activeTab === 'security' && <SecuritySection />}
        {activeTab === 'system' && <SystemSection />}
      </div>
    </div>
  );
}

function PlansSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => toast.error('Error al cargar planes'))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h2 className="text-white font-semibold mb-4 text-lg">Planes de Facturación</h2>
      {loading ? (
        <div className="animate-pulse text-slate-500 text-sm">Cargando planes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p.id} className="border border-slate-600 rounded-xl p-4 bg-slate-800 hover:border-amber-500/50 transition-colors">
              <h3 className="text-amber-500 font-bold mb-1">{p.name}</h3>
              <p className="text-slate-300 text-sm mb-3 min-h-[40px]">{p.description || 'Sin descripción'}</p>
              <div className="text-xl text-white font-semibold">
                ${p.price_mxn} <span className="text-sm font-normal text-slate-400">MXN</span>
              </div>
            </div>
          ))}
          <div className="border border-dashed border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer min-h-[140px]">
            <span className="text-sm font-medium">Próximamente: Crear plan</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-xl">
      <h2 className="text-white font-semibold mb-4 text-lg">Cambiar Contraseña</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña actual</label>
          <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nueva contraseña</label>
          <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar nueva contraseña</label>
          <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors" />
        </div>
        <div className="pt-2 flex justify-end">
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl text-sm transition-colors">
            Actualizar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemSection() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'error', database: 'disconnected' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold text-lg">Estado del Sistema</h2>
        <button onClick={fetchHealth} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors" title="Actualizar estado">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-white">API Backend</p>
              <p className="text-xs text-slate-500">Versión 2.1.0</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${health?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {health?.status === 'ok' ? 'Operativo' : 'Error'}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-white">Base de Datos</p>
              <p className="text-xs text-slate-500">PostgreSQL</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${health?.database === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {health?.database === 'connected' ? 'Conectada' : 'Desconectada'}
          </div>
        </div>
      </div>
    </div>
  );
}
