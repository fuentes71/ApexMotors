"use client";

import { Bell, AlertTriangle, Clock, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useData } from "../context/DataContext";
import { formatCurrency } from "../utils";

export function NotificationsWidget() {
  const { vehicles, fixedExpenses } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Calculate alerts
  const alerts: Array<{ id: string; title: string; message: string; type: "warning" | "danger" | "info" }> = [];

  // 1. Stock > 60 days
  vehicles.forEach(v => {
    if (v.status === "Em Estoque" || v.status === "Manutenção") {
      const entrada = new Date(v.entryDate).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((now - entrada) / (1000 * 3600 * 24));
      
      if (diffDays > 60) {
        alerts.push({
          id: `stock_${v.id}`,
          title: "Estoque Parado",
          message: `${v.name} está há ${diffDays} dias no estoque.`,
          type: "warning"
        });
      }
    }
  });

  // 2. Unpaid fixed expenses due in <= 3 days
  fixedExpenses.forEach(exp => {
    if (!exp.isPaid && exp.dueDate) {
      const due = new Date(exp.dueDate).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((due - now) / (1000 * 3600 * 24));
      
      if (diffDays <= 3 && diffDays >= 0) {
        alerts.push({
          id: `exp_${exp.id}`,
          title: "Vencimento Próximo",
          message: `${exp.name} de ${formatCurrency(exp.value)} vence em ${diffDays === 0 ? 'hoje' : `${diffDays} dias`}.`,
          type: "warning"
        });
      } else if (diffDays < 0) {
        alerts.push({
          id: `exp_late_${exp.id}`,
          title: "Despesa Atrasada",
          message: `${exp.name} está atrasada há ${Math.abs(diffDays)} dias.`,
          type: "danger"
        });
      }
    }
  });

  const unreadCount = alerts.length;

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <Bell size={16} className="text-stone-500" /> Notificações
            </h3>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-stone-500 flex flex-col items-center gap-2">
                <Check size={24} className="text-emerald-400" />
                <p className="text-sm">Tudo em dia!</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-4 hover:bg-stone-50 transition-colors flex gap-3 items-start">
                    {alert.type === 'warning' && <Clock size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />}
                    {alert.type === 'danger' && <AlertTriangle size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />}
                    {alert.type === 'info' && <Bell size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />}
                    
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800">{alert.title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5 leading-snug">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
