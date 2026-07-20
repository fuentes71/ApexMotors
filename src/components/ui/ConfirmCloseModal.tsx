import React from 'react';
import { X } from 'lucide-react';

interface ConfirmCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmCloseModal({ isOpen, onClose, onConfirm }: ConfirmCloseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center animate-in fade-in p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-8 max-w-md w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100/80 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5 text-white">
            <span className="text-3xl font-bold">!</span>
          </div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600 mb-3">
            Alterações não salvas
          </h3>
          <p className="text-stone-500 text-sm leading-relaxed px-4">
            Você tem alterações que não foram salvas. Se sair agora, você perderá todo o progresso recente. O que deseja fazer?
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl font-semibold text-stone-600 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200/80 backdrop-blur-sm transition-all cursor-pointer"
            >
              Continuar Editando
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-2xl font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 transition-all cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
