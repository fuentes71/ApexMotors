"use client";

import { usePathname, useParams } from "next/navigation";

import { DataProvider } from "../context/DataContext";
import { ToastProvider } from "../context/ToastContext";
import { Sidebar } from "../components/Sidebar";
import { VehicleModal } from "../components/VehicleModal";
import { ClientModal } from "../components/ClientModal";
import { ExpenseModal } from "../components/ExpenseModal";
import { EmployeeModal } from "../components/EmployeeModal";
import { AuthGuard } from "../components/AuthGuard";
import { defaultTenant } from "../utils/tenantConfig";

import { ConfirmProvider } from "../context/ConfirmContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const tenantId = (params?.tenant as string) || defaultTenant;
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/forgot-password');

  return (
    <ToastProvider>
      <ConfirmProvider>
        <DataProvider tenantId={tenantId}>
          {isAuthPage ? (
            children
          ) : (
            <AuthGuard>
              <div className="flex min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-blue-100 print:bg-white">
                <Sidebar />
                {children}
                <VehicleModal />
                <ClientModal />
                <ExpenseModal />
                <EmployeeModal />
              </div>
            </AuthGuard>
          )}
        </DataProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
