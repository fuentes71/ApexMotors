"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Vehicle, Expense } from "../types";

interface DataContextType {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  fixedExpenses: Expense[];
  setFixedExpenses: (expenses: Expense[]) => void;
  startMonth: string;
  setStartMonth: (month: string) => void;
  endMonth: string;
  setEndMonth: (month: string) => void;
  activeVehicle: Vehicle | null;
  setActiveVehicle: (v: Vehicle | null) => void;
  fullscreenImage: string | null;
  setFullscreenImage: (img: string | null) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [startMonth, setStartMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [endMonth, setEndMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([
    { id: "1", name: "Aluguel Estacionamento", value: 1500, recurrence: 'Mensal', startDate: '2024-01-01' },
    { id: "2", name: "Salário Sara", value: 1000, recurrence: 'Mensal', startDate: '2024-01-01' },
    { id: "3", name: "Anúncios Facebook", value: 20, recurrence: 'Diária', startDate: new Date().toISOString().split('T')[0] },
    { id: "4", name: "Lavagem Terceirizada", value: 150, recurrence: 'Semanal', startDate: new Date().toISOString().split('T')[0] },
    { id: "5", name: "Licença Software", value: 500, recurrence: 'Anual', startDate: '2024-01-01' },
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    // Veículo de Julho
    {
      id: "v1",
      name: "Audi A3 SPB",
      description: "Revisão completa antes da venda.",
      image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
      galeria: [
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
      ],
      valorCompra: 80000,
      valorVenda: 95000,
      status: "Em Estoque",
      dataEntrada: "2026-07-02",
      despesas: [
        { id: "e1", name: "Troca de Óleo", value: 450, category: "Mecânica" },
        { id: "e2", name: "Anúncio Webmotors", value: 120, category: "Marketing" },
      ]
    },
    // Veículo de Junho
    {
      id: "v2",
      name: "Jeep Compass",
      description: "Carro de repasse.",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      galeria: [],
      valorCompra: 110000,
      valorVenda: 135000,
      status: "Vendido",
      dataEntrada: "2026-06-15",
      dataVenda: "2026-06-25",
      despesas: [
        { id: "e3", name: "Polimento", value: 300, category: "Funilaria" },
        { id: "e4", name: "IPVA Parcial", value: 1200, category: "Documentação" },
      ]
    },
    // Veículo de Maio (para ter mais dados)
    {
      id: "v3",
      name: "Honda Civic Touring",
      description: "Único dono, todas as revisões na CSS.",
      image: "https://images.unsplash.com/photo-1629897148590-7d3d0f01eb06?auto=format&fit=crop&w=800&q=80",
      galeria: [],
      valorCompra: 120000,
      valorVenda: 145000,
      status: "Vendido",
      dataEntrada: "2026-05-10",
      dataVenda: "2026-05-20",
      despesas: [
        { id: "e5", name: "Higienização interna", value: 250, category: "Mecânica" },
      ]
    },
    {
      id: "v4",
      name: "VW Nivus Highline",
      description: "Modelo top de linha com pacote ADAS.",
      image: "https://images.unsplash.com/photo-1698226065545-c42b2ab62867?auto=format&fit=crop&w=800&q=80",
      galeria: [],
      valorCompra: 105000,
      valorVenda: 125000,
      status: "Em Estoque",
      dataEntrada: "2026-07-05",
      despesas: [
        { id: "e6", name: "Vitrificação", value: 800, category: "Funilaria" },
      ]
    },
    {
      id: "v5",
      name: "Toyota Corolla XEi",
      description: "Perfeito estado de conservação.",
      image: "https://images.unsplash.com/photo-1623813350293-85ecb1bc32c3?auto=format&fit=crop&w=800&q=80",
      galeria: [],
      valorCompra: 95000,
      valorVenda: 110000,
      status: "Em Estoque",
      dataEntrada: "2026-07-10",
      despesas: [
        { id: "e7", name: "Transferência", value: 350, category: "Documentação" },
        { id: "e8", name: "Pneus novos", value: 1600, category: "Mecânica" }
      ]
    },
    {
      id: "v6",
      name: "Chevrolet Tracker Premier",
      description: "Versão turbo completa.",
      image: "https://images.unsplash.com/photo-1681240212354-94943fcfd3ff?auto=format&fit=crop&w=800&q=80",
      galeria: [],
      valorCompra: 115000,
      valorVenda: 140000,
      status: "Vendido",
      dataEntrada: "2026-06-20",
      dataVenda: "2026-07-12",
      despesas: [
        { id: "e9", name: "Revisão na CSS", value: 1100, category: "Mecânica" },
        { id: "e10", name: "Anúncios Inst/FB", value: 200, category: "Marketing" }
      ]
    }
  ]);

  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <DataContext.Provider value={{
      vehicles, setVehicles,
      fixedExpenses, setFixedExpenses,
      startMonth, setStartMonth,
      endMonth, setEndMonth,
      activeVehicle, setActiveVehicle,
      fullscreenImage, setFullscreenImage,
      isMobileMenuOpen, setIsMobileMenuOpen
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
