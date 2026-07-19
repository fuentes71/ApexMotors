"use client";

import { useData } from "@/context/DataContext";
import { Header } from "@/components/Header";
import { InventoryView } from "@/components/InventoryView";
import { Vehicle } from "@/types";
import api from "@/services/api";

export default function VeiculosPage() {
  const { vehicles, setVehicles, setActiveVehicle, startMonth, endMonth } = useData();

  const filteredVehicles = vehicles.filter(v => {
    if (v.status === "Vendido" && v.saleDate) {
      const vendaMonth = v.saleDate.substring(0, 7);
      return vendaMonth >= startMonth && vendaMonth <= endMonth;
    }
    return v.entryDate <= `${endMonth}-31`;
  });

  const handleAddVehicle = async () => {
    const newV: Vehicle = {
      id: Date.now().toString(),
      name: "Novo Veículo",
      description: "Adicione uma descrição",
      image: "",
      gallery: [],
      purchaseValue: 0,
      saleValue: 0,
      expenses: [],
      status: "Em Estoque",
      entryDate: new Date().toISOString().split('T')[0]
    };
    try {
      const res = await api.post('/vehicles', newV);
      setVehicles([...vehicles, res.data]);
      setActiveVehicle(res.data);
    } catch (e) {
      console.error(e);
      // Fallback local
      setVehicles([...vehicles, newV]);
      setActiveVehicle(newV);
    }
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
