"use client";

import { useData } from "@/context/DataContext";
import { Header } from "@/components/Header";
import { InventoryView } from "@/components/InventoryView";
import { Vehicle } from "@/types";
import api from "@/services/api";

export default function VeiculosPage() {
  const { vehicles, setVehicles, setActiveVehicle, startMonth, endMonth } = useData();

  const filteredVehicles = vehicles.filter(v => {
    if (v.status === "Sold" && v.saleDate) {
      const vendaMonth = v.saleDate.substring(0, 7);
      return vendaMonth >= startMonth && vendaMonth <= endMonth;
    }
    return v.entryDate <= `${endMonth}-31`;
  });

  const handleAddVehicle = () => {
    const newV: Vehicle = {
      name: "",
      description: "",
      image: "",
      gallery: [],
      purchaseValue: 0,
      saleValue: 0,
      expenses: [],
      status: "In Stock",
      entryDate: new Date().toISOString().split('T')[0]
    };
    setActiveVehicle(newV);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto">
      <Header />
      <div className="px-6 lg:px-10 max-w-5xl mx-auto w-full pb-10">
        <InventoryView
          filteredVehicles={filteredVehicles}
          vehicles={vehicles}
          setVehicles={setVehicles}
          setActiveVehicle={setActiveVehicle}
          handleAddVehicle={handleAddVehicle}
        />
      </div>

    </div>
  );
}
