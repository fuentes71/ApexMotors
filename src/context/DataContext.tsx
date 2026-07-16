"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { Vehicle, Expense, Client } from "../types";
import api from "../services/api";

interface DataContextType {
  vehicles: Vehicle[];
  setVehicles: Dispatch<SetStateAction<Vehicle[]>>;
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
  contractTemplate: string;
  setContractTemplate: (template: string) => void;
  clients: Client[];
  setClients: Dispatch<SetStateAction<Client[]>>;
  activeClient: Client | null;
  setActiveClient: (c: Client | null) => void;
  activeExpense: Expense | null;
  setActiveExpense: (e: Expense | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [contractTemplate, setContractTemplate] = useState(`Pelo presente instrumento, eu, {{buyerName}}, inscrito(a)
no CPF/CNPJ sob o nº {{buyerDoc}}, declaro ter comprado o veículo abaixo
descrito da empresa {{sellerName}},
inscrita no CNPJ sob o nº {{sellerDoc}}.

DADOS DO VEÍCULO:
- Veículo: {{vehicleName}}
- Placa: {{vehiclePlaca}}
- Renavam: {{vehicleRenavam}}
- Valor Acordado: {{vehiclePrice}}

Declaro ainda ter recebido o veículo nas condições em que se encontra e
totalmente livre de desembaraços e débitos até a presente data, tornando-me
responsável a partir deste momento por quaisquer multas, impostos ou taxas.`);

  const [startMonth, setStartMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [endMonth, setEndMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);

  useEffect(() => {
    // Fetch initial data from mock API
    api.get('/vehicles').then(res => setVehicles(res.data)).catch(console.error);
    api.get('/expenses').then(res => setFixedExpenses(res.data)).catch(console.error);
    api.get('/clients').then(res => setClients(res.data)).catch(console.error);
  }, []);

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
      isMobileMenuOpen, setIsMobileMenuOpen,
      contractTemplate,
      setContractTemplate,
      clients,
      setClients,
      activeClient,
      setActiveClient,
      activeExpense,
      setActiveExpense
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
