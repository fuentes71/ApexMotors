"use client";

import { LayoutDashboard, CarFront, Wallet, Settings, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "../context/DataContext";
import { useState } from "react";

export function Sidebar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useData();
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'veiculos', href: '/vehicles', label: 'Inventário', icon: CarFront },
    { id: 'financeiro', href: '/finance', label: 'Financeiro', icon: Wallet },
  ];

  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="w-64 bg-[#FAFAFA] border-r border-stone-200/60 hidden lg:flex flex-col sticky top-0 h-screen print:hidden z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-sm">
            AM
          </div>
          <span className="font-semibold text-[15px] text-stone-900 tracking-tight">ApexMotors</span>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-3">Menu</p>
          
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = getIsActive(item.href);
            return (
              <Link 
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-stone-200/50 font-medium' 
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/30'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-stone-900' : 'text-stone-400'} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-200/60 relative">
          {isSettingsOpen && (
            <div className="absolute bottom-[80px] left-4 right-4 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50">
              <Link 
                href="/settings" 
                onClick={() => setIsSettingsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
              >
                <div className="w-6 h-6 bg-rose-50 text-rose-600 rounded flex items-center justify-center font-bold text-[10px]">
                  PDF
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Modelos e PDF</span>
                  <span className="text-[10px] text-stone-400">Editar contratos</span>
                </div>
              </Link>
            </div>
          )}

          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-200/30 transition-all"
          >
            <Settings size={16} className="text-stone-400" />
            Configurações
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all mt-1">
            <LogOut size={16} className="text-rose-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* --- SIDEBAR MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative w-64 bg-[#FAFAFA] h-full flex flex-col shadow-2xl animate-in slide-in-from-left">
            <div className="p-6 flex items-center justify-between border-b border-stone-200/60">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center text-white text-xs font-bold">
                  AM
                </div>
                <span className="font-semibold text-[15px] text-stone-900 tracking-tight">ApexMotors</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X size={18} />
              </button>
            </div>
            
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              <p className="px-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-3">Menu</p>
              
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = getIsActive(item.href);
                return (
                  <Link 
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive 
                        ? 'bg-white text-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-stone-200/50 font-medium' 
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/30'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-stone-900' : 'text-stone-400'} /> 
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-stone-200/60 relative">
              {isSettingsOpen && (
                <div className="absolute bottom-[80px] left-4 right-4 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50">
                  <Link 
                    href="/settings" 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  >
                    <div className="w-6 h-6 bg-rose-50 text-rose-600 rounded flex items-center justify-center font-bold text-[10px]">
                      PDF
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Modelos e PDF</span>
                      <span className="text-[10px] text-stone-400">Editar contratos</span>
                    </div>
                  </Link>
                </div>
              )}

              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-200/30 transition-all"
              >
                <Settings size={16} className="text-stone-400" />
                Configurações
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all mt-1">
                <LogOut size={16} className="text-rose-400" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
