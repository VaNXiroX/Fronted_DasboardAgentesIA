import React from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { Input } from "./ui/input";
import { ThemeSwitcher } from "./ThemeSwitcher";

const titles = {
  "/": "Panel",
  "/agents": "Agentes",
  "/clients": "Clientes",
  "/settings": "Configuración",
};

export const Topbar = ({ rightSlot }) => {
  const { pathname } = useLocation();
  let title = titles[pathname] || "";
  if (!title && pathname.startsWith("/agents")) title = "Agentes";

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-zinc-800 theme-topbar backdrop-blur-md transition-colors duration-300">
      <div className="h-full px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Espacio de trabajo / Producción
          </span>
          <span className="text-zinc-700">›</span>
          <h1 className="font-display text-base font-medium text-zinc-100" data-testid="page-title">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" strokeWidth={1.6} />
            <Input
              placeholder="Buscar agentes, modelos…"
              className="w-72 pl-9 bg-zinc-950 border-zinc-800 text-sm placeholder:text-zinc-600 focus-visible:ring-zinc-600"
              data-testid="topbar-search"
            />
          </div>
          {rightSlot}

          {/* Selector de tema */}
          <ThemeSwitcher />

          <button
            className="h-9 w-9 grid place-items-center rounded-md border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors theme-btn"
            data-testid="topbar-notifications"
            title="Notificaciones"
          >
            <Bell className="h-4 w-4" strokeWidth={1.6} />
          </button>
          <div className="h-9 w-9 rounded-md bg-zinc-800 grid place-items-center text-xs font-mono text-zinc-300 border border-zinc-700">
            US
          </div>
        </div>
      </div>
    </header>
  );
};
