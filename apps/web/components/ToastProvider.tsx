"use client";
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: number; title?: string; message: string; kind?: 'info'|'success'|'error' };

const ToastCtx = createContext<{ add: (t: Omit<Toast,'id'>) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((t: Omit<Toast,'id'>) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ add }), [add]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`shadow-lg rounded-lg px-4 py-3 text-white ${t.kind==='error'?'bg-red-600':t.kind==='success'?'bg-green-600':'bg-gray-900'}`}>
            {t.title && <div className="font-semibold">{t.title}</div>}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


