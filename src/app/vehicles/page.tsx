"use client";

import { useData } from "../../context/DataContext";
import { Header } from "../../components/Header";
import { InventoryView } from "../../components/InventoryView";
import { Vehicle } from "../../types";

export default function VeiculosPage() {
  const { vehicles, setVehicles, setActiveVehicle, startMonth, endMonth } = useData();

  const filteredVehicles = vehicles.filter(v => {
    if (v.status === "Vendido" && v.dataVenda) {
      const vendaMonth = v.dataVenda.substring(0, 7);
      return vendaMonth >= startMonth && vendaMonth <= endMonth;
    }
    return v.dataEntrada <= `${endMonth}-31`;
  });

  const handleAddVehicle = () => {
    const newV: Vehicle = {
      id: Date.now().toString(),
      name: "Novo Veículo",
      description: "Adicione uma descrição",
      image: "",
      galeria: [],
      valorCompra: 0,
      valorVenda: 0,
      despesas: [],
      status: "Em Estoque",
      dataEntrada: new Date().toISOString().split('T')[0]
    };
    setVehicles([...vehicles, newV]);
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

      <button
        onClick={handleAddVehicle}
        title="Adicionar Veículo"
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 flex items-center justify-center bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all print:hidden z-40 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-200"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>
  );
}
