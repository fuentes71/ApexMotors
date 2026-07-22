"use client";

import { LayoutDashboard, CarFront, Settings, LogOut, X, Users, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "../context/DataContext";
import { logout } from "../services/api";
import { RoleEnum } from "../utils";

export function Sidebar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen, tenantId, tenantConfig, currentUser, setCurrentUser } = useData();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@apexMotors:whatsappTemplates_v2');
    }
    router.push(`/${tenantId}/login`);
  };
  
  // Sellers can't see the dashboard or the finance/expenses screen.
  const isSeller = currentUser?.role === 'Seller';

  const navItems = [
    ...(!isSeller ? [{ id: 'dashboard', href: `/${tenantId}`, label: 'Dashboard', icon: LayoutDashboard }] : []),
    { id: 'veiculos', href: `/${tenantId}/vehicles`, label: 'Inventário', icon: CarFront },
    { id: 'clientes', href: `/${tenantId}/clients`, label: 'Clientes', icon: Users },
    ...(!isSeller ? [{ id: 'financeiro', href: `/${tenantId}/finance`, label: 'Financeiro', icon: Wallet }] : []),
  ];

  if (currentUser?.role === 'Admin') {
    navItems.push({ id: 'funcionarios', href: `/${tenantId}/employees`, label: 'Funcionários', icon: Users });
  }

  const getIsActive = (href: string) => {
    if (href === `/${tenantId}`) return pathname === `/${tenantId}`;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="w-64 bg-[#FAFAFA] border-r border-stone-200/60 hidden lg:flex flex-col sticky top-0 h-screen print:hidden z-40">
        <div className="p-6 flex items-center gap-3">
          {tenantConfig.logoUrl && <Image src={tenantConfig.logoUrl} alt={`${tenantConfig.name} Logo`} width={28} height={28} className="rounded-md object-cover" />}
          <span className="font-semibold text-[15px] text-stone-900 tracking-tight">{tenantConfig.name}</span>
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
        
        {currentUser && (
          <div className="p-3 border-t border-stone-200/60">
            <div className="group flex items-center gap-2.5 rounded-xl bg-white p-1.5 pl-2 ring-1 ring-stone-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors hover:ring-stone-300/70">
              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-stone-900 truncate leading-tight">{currentUser.name}</span>
                <span className="text-[11px] text-stone-400 truncate leading-tight mt-0.5">{RoleEnum[currentUser.role] || currentUser.role}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {currentUser.role === 'Admin' && (
                  <Link
                    href={`/${tenantId}/settings`}
                    aria-label="Configurações"
                    title="Configurações"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
                  >
                    <Settings size={16} />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  aria-label="Sair"
                  title="Sair"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* --- SIDEBAR MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative w-64 bg-[#FAFAFA] h-full flex flex-col shadow-2xl animate-in slide-in-from-left">
            <div className="p-6 flex items-center justify-between border-b border-stone-200/60">
              <div className="flex items-center gap-3">
                {tenantConfig.logoUrl && <Image src={tenantConfig.logoUrl} alt={`${tenantConfig.name} Logo`} width={28} height={28} className="rounded-md object-cover" />}
                <span className="font-semibold text-[15px] text-stone-900 tracking-tight">{tenantConfig.name}</span>
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
            {currentUser && (
              <div className="p-3 border-t border-stone-200/60">
                <div className="flex items-center gap-2.5 rounded-xl bg-white p-1.5 pl-2 ring-1 ring-stone-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-stone-900 truncate leading-tight">{currentUser.name}</span>
                    <span className="text-[11px] text-stone-400 truncate leading-tight mt-0.5">{RoleEnum[currentUser.role] || currentUser.role}</span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {currentUser.role === 'Admin' && (
                      <Link
                        href={`/${tenantId}/settings`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Configurações"
                        title="Configurações"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
                      >
                        <Settings size={16} />
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      aria-label="Sair"
                      title="Sair"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
