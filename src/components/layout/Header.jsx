import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Menu, Search, RefreshCw } from 'lucide-react';

const routeLabels = {
  '/':         'Dashboard',
  '/clients':  'Clientes',
  '/agents':   'Agentes',
  '/settings': 'Configuración',
};

export function Header({ onMenuClick, onRefresh, isRefreshing, clientName }) {
  const location = useLocation();

  const buildBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/clients/') && clientName) {
      return (
        <>
          <span className="text-slate-500">Clientes</span>
          <span className="text-slate-600 mx-1.5">/</span>
          <span className="text-slate-200">{clientName}</span>
        </>
      );
    }
    return <span className="text-slate-200">{routeLabels[path] ?? path}</span>;
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 h-14 bg-slate-900/80 border-b border-slate-700/60 backdrop-blur-sm">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <nav className="text-sm flex items-center" aria-label="Breadcrumb">
          {buildBreadcrumb()}
        </nav>
      </div>

      {/* Right: search + refresh */}
      <div className="flex items-center gap-2">
        {/* Cosmetic search */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-500 text-sm cursor-default select-none">
          <Search className="w-4 h-4" />
          <span>Buscar...</span>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          aria-label="Actualizar"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
