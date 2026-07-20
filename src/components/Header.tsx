"use client";

import { Menu, Download, ChevronDown, Calendar, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { formatMonth, formatCurrency, calculateTotalFixedForPeriod } from "../utils";
import { generateStructuredPDF } from "../utils/pdfExport";
import { useData } from "../context/DataContext";
import { useState, useRef, useEffect } from "react";

function CustomSelect({ value, onChange, options, minStr }: { value: string, onChange: (v: string) => void, options: string[], minStr?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredOptions = minStr ? options.filter(o => o >= minStr) : options;

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-transparent py-1.5 pl-3 pr-2 text-sm font-semibold text-stone-700 outline-none cursor-pointer hover:bg-stone-50 transition-colors rounded-md w-full justify-between"
      >
        <span>{formatMonth(value)}</span>
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-36 max-h-60 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 animate-in fade-in zoom-in-95 origin-top-left p-1.5 hide-scrollbar">
          {filteredOptions.map(m => (
            <button
              key={m}
              onClick={() => { onChange(m); setIsOpen(false); }}
              className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-lg hover:bg-stone-100 transition-colors ${value === m ? 'bg-stone-50 font-bold text-stone-900' : 'text-stone-600 font-medium'}`}
            >
              {formatMonth(m)}
              {value === m && <Check size={14} className="text-stone-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { vehicles, fixedExpenses, setIsMobileMenuOpen, startMonth, setStartMonth, endMonth, setEndMonth, tenantConfig, tenantId } = useData();
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.includes('/vehicles')) return 'Inventário de Veículos';
    if (pathname.includes('/finance')) return 'Controle Financeiro';
    if (pathname.includes('/clients')) return 'Gestão de Clientes';
    return 'Dashboard';
  };

  const isDashboard = pathname === `/${tenantId}` || pathname === `/${tenantId}/`;
  const isFinance = pathname.includes('/finance');
  const isClients = pathname.includes('/clients');
  const isVehicles = pathname.includes('/vehicles');

  // --- Lista Dinâmica de Meses para o Filtro ---
  let minMonth = new Date().toISOString().substring(0, 7);
  
  vehicles.forEach(v => {
    const entryM = v.entryDate?.substring(0, 7);
    if (entryM && entryM < minMonth) minMonth = entryM;
    if (v.saleDate) {
      const saleM = v.saleDate.substring(0, 7);
      if (saleM < minMonth) minMonth = saleM;
    }
  });

  fixedExpenses.forEach(e => {
    if (e.dueDate) {
      const dueM = e.dueDate.substring(0, 7);
      if (dueM < minMonth) minMonth = dueM;
    }
  });

  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthOptions: string[] = [];
  
  let current = new Date(minMonth + '-02'); // dia 02 para evitar fuso
  const end = new Date(currentMonth + '-02');
  
  while (current <= end) {
    monthOptions.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    current.setMonth(current.getMonth() + 1);
  }
  
  if (monthOptions.length === 0) {
    monthOptions.push(currentMonth);
  }

  const filteredVehicles = vehicles.filter(v => {
    if (v.status === "Sold" && v.saleDate) {
      const vendaMonth = v.saleDate.substring(0, 7);
      return vendaMonth >= startMonth && vendaMonth <= endMonth;
    }
    return v.entryDate <= `${endMonth}-31`;
  });

  const totalFixed = calculateTotalFixedForPeriod(fixedExpenses, startMonth, endMonth);
  
  const totalVehicleProfit = filteredVehicles.reduce((acc, v) => {
    if (v.status !== 'Sold') return acc;
    const expenses = v.expenses.reduce((sum, e) => sum + e.value, 0);
    return acc + ((v.saleValue || 0) - (v.purchaseValue || 0) - expenses);
  }, 0);

  const netBalance = totalVehicleProfit - totalFixed;

  const handleExportPDF = () => {
    generateStructuredPDF({
      startMonth,
      endMonth,
      vehicles: filteredVehicles,
      fixedExpenses,
      netBalance,
      totalVehicleProfit,
      totalFixed
    });
  };

  return (
    <header className="max-w-5xl mx-auto w-full pt-16 lg:pt-8 pb-8 px-6 lg:px-10 border-b border-stone-200 mb-8 print:pt-4 flex-shrink-0 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <div className="lg:hidden fixed top-4 left-4 z-40 print:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-3 bg-white shadow-md border border-stone-100 text-stone-700 hover:text-stone-900 rounded-full transition-all active:scale-95"
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="hidden print:flex items-center gap-4 mb-6 pb-6 border-b border-stone-200">
            {tenantConfig.logoUrl && <Image src={tenantConfig.logoUrl} alt={`${tenantConfig.name} Logo`} width={48} height={48} className="rounded-lg object-cover" />}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Relatório {tenantConfig.name}</h1>
              <p className="text-stone-500">{getTitle()} • {startMonth === endMonth ? formatMonth(startMonth) : `${formatMonth(startMonth)} a ${formatMonth(endMonth)}`}</p>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 print:hidden">{getTitle()}</h1>
          {isFinance && (
            <p className="text-sm text-stone-500 mt-1 print:hidden">Controle os custos fixos e recorrentes do período.</p>
          )}
          {isClients && (
            <p className="text-sm text-stone-500 mt-1 print:hidden">Acompanhe interessados, negociações em andamento e clientes fidelizados.</p>
          )}
          {isVehicles && (
            <p className="text-sm text-stone-500 mt-1 print:hidden">Gerencie o estoque de veículos, compras e vendas.</p>
          )}
          
          {(isDashboard || isFinance) && (
            <>
              <div className="flex flex-wrap items-center gap-3 mt-3 print:hidden">
                <div className="flex items-center gap-0 bg-white p-1 rounded-lg border border-stone-200 shadow-sm">
                  <div className="flex items-center pl-3 pr-2 border-r border-stone-100">
                    <Calendar size={14} className="text-stone-400" />
                  </div>
                  
                  {isDashboard ? (
                    <>
                      <CustomSelect value={startMonth} onChange={setStartMonth} options={monthOptions} />
                      <div className="flex items-center px-2 text-stone-300">
                        <span className="text-xs font-medium uppercase tracking-wider">Até</span>
                      </div>
                      <CustomSelect value={endMonth} onChange={setEndMonth} options={monthOptions} minStr={startMonth} />
                    </>
                  ) : (
                    <CustomSelect 
                      value={startMonth} 
                      onChange={(val) => {
                        setStartMonth(val);
                        setEndMonth(val);
                      }} 
                      options={monthOptions} 
                    />
                  )}
                </div>
                
                {(isDashboard || isFinance) && (
                  <button 
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm"
                  >
                    <Download size={14} /> Exportar PDF
                  </button>
                )}

              </div>
            </>
          )}
        </div>

        {(isDashboard || isFinance) && (
          <div className="flex gap-6 text-right">
            {isDashboard && (
              <>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-1">Despesas Fixas</p>
                  <p className="text-lg font-semibold text-rose-600">{formatCurrency(totalFixed)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-1">Balanço Total (Vendas)</p>
                  <p className={`text-lg font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(netBalance)}
                  </p>
                </div>
              </>
            )}
            {isFinance && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-1">Total no Período</p>
                <p className="text-lg font-bold text-rose-600">{formatCurrency(totalFixed)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
