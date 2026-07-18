"use client";

import { usePathname } from "next/navigation";

import { DataProvider } from "../context/DataContext";
import { ToastProvider } from "../context/ToastContext";
import { Sidebar } from "../components/Sidebar";
import { VehicleModal } from "../components/VehicleModal";
import { ClientModal } from "../components/ClientModal";
import { ExpenseModal } from "../components/ExpenseModal";

import { ConfirmProvider } from "../context/ConfirmContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login');

  return (
    <ToastProvider>
      <ConfirmProvider>
        <DataProvider>
          {isAuthPage ? (
            children
          ) : (
            <div className="flex min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-blue-100 print:bg-white">
              <Sidebar />
              {children}
              <VehicleModal />
              <ClientModal />
              <ExpenseModal />
            </div>
          )}
        </DataProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
