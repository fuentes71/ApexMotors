"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AlertTriangle, X, Trash2, Info } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveFn, setResolveFn] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveFn(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveFn) resolveFn(true);
  }, [resolveFn]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveFn) resolveFn(false);
  }, [resolveFn]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" onClick={handleCancel}></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleCancel}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100/80 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-5 text-white ${
                  options.type === 'danger' ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30' :
                  options.type === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30' :
                  'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                }`}>
                {options.type === 'danger' && <Trash2 size={32} />}
                {options.type === 'warning' && <AlertTriangle size={32} />}
                {(!options.type || options.type === 'info') && <Info size={32} />}
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600 mb-3">
                {options.title || "Confirmar ação"}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed px-4">
                {options.message}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className={`relative overflow-hidden w-full px-4 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex justify-center items-center ${
                  options.type === 'danger' ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/25' :
                  options.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25' :
                  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                }`}
              >
                <span className="drop-shadow-sm">{options.confirmText || "Confirmar"}</span>
              </button>
              
              <button
                onClick={handleCancel}
                className="w-full px-4 py-3 rounded-2xl font-semibold text-stone-600 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200/80 backdrop-blur-sm transition-all cursor-pointer"
              >
                {options.cancelText || "Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
