import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Bot, ScrollText, LogOut, Settings } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';
import { useAuth } from '../../context/AuthContext';
import { LogsModal } from '../LogsModal';

const navItems = [
  { to: '/',        label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { to: '/clients', label: 'Clientes',      icon: Users },
  { to: '/agents',  label: 'Agentes',       icon: Bot },
  { to: '/settings',label: 'Configuración', icon: Settings },
];

export function Sidebar({ open, onClose }) {
  const healthy = useHealth(30000);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [logsOpen, setLogsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 flex flex-col
          bg-slate-800 border-r border-slate-700
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-slate-900 font-bold text-sm">AR</span>
          </div>
          <div>
            <p className="text-white font-display text-lg leading-tight tracking-wider">ÁMBAR ROJO</p>
            <p className="text-slate-400 text-xs">Operations</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-amber-400 border-l-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: System status + user + actions */}
        <div className="px-4 py-4 border-t border-slate-700 space-y-3">
          {/* System OK */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full pulse-dot ${
                healthy === null
                  ? 'bg-slate-500'
                  : healthy
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                healthy === null
                  ? 'text-slate-400'
                  : healthy
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {healthy === null ? 'Verificando...' : healthy ? 'System OK' : 'System Down'}
            </span>
          </div>

          {/* User block */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-400 text-xs font-bold">AR</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.username || 'Admin'}</p>
              <p className="text-slate-500 text-xs">Admin</p>
            </div>
          </div>

          {/* Ver Logs */}
          <button
            id="btn-ver-logs"
            onClick={() => { setLogsOpen(true); onClose && onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors group"
          >
            <ScrollText className="w-4 h-4 flex-shrink-0 group-hover:text-sky-400 transition-colors" />
            <span>Ver Logs</span>
          </button>

          {/* Cerrar sesión */}
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors group"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-400 transition-colors" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <LogsModal open={logsOpen} onClose={() => setLogsOpen(false)} />
    </>
  );
}
