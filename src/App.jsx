import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './lib/toast';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Agents from './pages/Agents';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl font-black text-slate-700 mb-4">404</div>
      <p className="text-slate-300 text-xl font-semibold mb-2">Página no encontrada</p>
      <p className="text-slate-500 text-sm">La ruta que buscas no existe en este sistema.</p>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/clients"   element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/agents"    element={<Agents />} />
            <Route path="*"          element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
