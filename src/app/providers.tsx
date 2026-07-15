"use client";

import { DataProvider } from "../context/DataContext";
import { Sidebar } from "../components/Sidebar";
import { VehicleModal } from "../components/VehicleModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div className="flex min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-blue-100 print:bg-white">
        <Sidebar />
        {children}
        <VehicleModal />
      </div>
    </DataProvider>
  );
}
