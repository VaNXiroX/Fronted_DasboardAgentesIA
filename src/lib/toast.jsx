import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 210);
    }, 4000);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div id="toast-container">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={() => {
              setToasts((prev) =>
                prev.map((x) => (x.id === t.id ? { ...x, exiting: true } : x))
              );
              setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 210);
            }} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function Toast({ message, type, exiting, onClose }) {
  const isError = type === 'error';
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl min-w-[280px] max-w-[400px] ${
        exiting ? 'toast-exit' : 'toast-enter'
      } ${
        isError
          ? 'bg-red-950/90 border-red-800 text-red-100'
          : 'bg-emerald-950/90 border-emerald-800 text-emerald-100'
      }`}
    >
      <span className={`text-lg ${isError ? 'text-red-400' : 'text-emerald-400'}`}>
        {isError ? '✕' : '✓'}
      </span>
      <p className="text-sm flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-50 hover:opacity-100 text-xs ml-2 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
