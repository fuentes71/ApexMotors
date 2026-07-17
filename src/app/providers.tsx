"use client";

import { DataProvider } from "../context/DataContext";
import { ToastProvider } from "../context/ToastContext";
import { Sidebar } from "../components/Sidebar";
import { VehicleModal } from "../components/VehicleModal";
import { ClientModal } from "../components/ClientModal";
import { ExpenseModal } from "../components/ExpenseModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DataProvider>
        <div className="flex min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-blue-100 print:bg-white">
          <Sidebar />
          {children}
          <VehicleModal />
          <ClientModal />
          <ExpenseModal />
        </div>
      </DataProvider>
    </ToastProvider>
  );
}
