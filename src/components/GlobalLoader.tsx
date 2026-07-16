"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleEnd = () => setIsLoading(false);

    window.addEventListener('api-load-start', handleStart);
    window.addEventListener('api-load-end', handleEnd);

    return () => {
      window.removeEventListener('api-load-start', handleStart);
      window.removeEventListener('api-load-end', handleEnd);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-xl rounded-full pl-3 pr-4 py-2.5 flex items-center gap-3 z-[100] border border-stone-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Loader2 size={16} className="animate-spin text-blue-600" />
      <span className="text-sm text-stone-600 font-medium tracking-tight">Sincronizando...</span>
    </div>
  );
}
