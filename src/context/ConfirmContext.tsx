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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={handleCancel}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-3 rounded-full ${
                  options.type === 'danger' ? 'bg-rose-100 text-rose-600' :
                  options.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {options.type === 'danger' && <Trash2 size={24} />}
                  {options.type === 'warning' && <AlertTriangle size={24} />}
                  {(!options.type || options.type === 'info') && <Info size={24} />}
                </div>
                <div className="flex-1 mt-1">
                  <h3 className="text-lg font-bold text-stone-900">
                    {options.title || "Confirmar ação"}
                  </h3>
                  <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                    {options.message}
                  </p>
                </div>
                <button 
                  onClick={handleCancel}
                  className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="bg-stone-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-sm"
              >
                {options.cancelText || "Cancelar"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors ${
                  options.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                  options.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {options.confirmText || "Confirmar"}
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
