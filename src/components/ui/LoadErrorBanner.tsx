"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useData } from "@/context/DataContext";

/**
 * Shown when a core list failed to load. Without it a failed fetch reads as an
 * empty account (zeros everywhere), which is indistinguishable from real data.
 */
export function LoadErrorBanner() {
  const { loadError, fetchData } = useData();
  const [retrying, setRetrying] = useState(false);

  if (!loadError) return null;

  const retry = async () => {
    setRetrying(true);
    try {
      await fetchData();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 shadow-lg max-w-[90vw]"
    >
      <AlertTriangle size={18} className="shrink-0" />
      <span className="text-sm font-medium">
        Não foi possível carregar seus dados. Verifique a conexão.
      </span>
      <button
        type="button"
        onClick={retry}
        disabled={retrying}
        className="ml-1 inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-900 disabled:opacity-60"
      >
        {retrying ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <RefreshCw size={15} />
        )}
        Tentar novamente
      </button>
    </div>
  );
}
