import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Bot, Settings, Activity, Users } from "lucide-react";

const items = [
  { to: "/",        label: "Panel",         icon: LayoutDashboard, end: true, testid: "nav-dashboard" },
  { to: "/agents",  label: "Agentes",       icon: Bot,             testid: "nav-agents"   },
  { to: "/clients", label: "Clientes",      icon: Users,           testid: "nav-clients"  },
  { to: "/settings",label: "Configuración", icon: Settings,        testid: "nav-settings" },
];

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-zinc-800 theme-sidebar transition-colors duration-300">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-zinc-800">
        <div className="h-7 w-7 rounded-md bg-white flex items-center justify-center">
          <Activity className="h-4 w-4 text-zinc-950" strokeWidth={2.2} />
        </div>
        <div className="font-display font-semibold tracking-tight text-white text-[15px]">
          Sentinel<span className="text-zinc-500">.ai</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
          Espacio de trabajo
        </div>
        {items.map(({ to, label, icon: Icon, end, testid }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-testid={testid}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-zinc-800/60 text-white border border-zinc-800"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent"
              }`
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-1">
          Sistema
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-xs text-zinc-300">Todos los sistemas operativos</span>
        </div>
      </div>
    </aside>
  );
};
