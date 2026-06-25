import React, { useState, createContext, useContext, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const RefreshContext = createContext({ triggerRefresh: () => {}, refreshKey: 0, clientName: '' });
export const useRefresh = () => useContext(RefreshContext);
export const useClientName = () => useContext(RefreshContext).clientName;

// Provider to set client name for breadcrumbs from child pages
export const RefreshProvider = RefreshContext.Provider;

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clientName, setClientName] = useState('');

  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  return (
    <RefreshContext.Provider value={{ triggerRefresh, refreshKey, clientName, setClientName }}>
      <div className="flex h-screen bg-slate-900 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen((o) => !o)}
            onRefresh={triggerRefresh}
            isRefreshing={isRefreshing}
            clientName={clientName}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </RefreshContext.Provider>
  );
}
