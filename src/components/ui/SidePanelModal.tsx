import React from 'react';

interface SidePanelModalProps {
  onCloseAttempt: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
  bgClass?: string;
}

export function SidePanelModal({ 
  onCloseAttempt, 
  children, 
  maxWidthClass = 'max-w-md',
  bgClass = 'bg-white'
}: SidePanelModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onCloseAttempt}></div>
      <div 
        className={`relative z-10 w-full h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ${maxWidthClass} ${bgClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
