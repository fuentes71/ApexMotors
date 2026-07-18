"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { Vehicle, Expense, Client, WhatsAppTemplates, Employee, Role } from "../types";
import api from "../services/api";

interface DataContextType {
  currentUser: Employee | null;
  setCurrentUser: Dispatch<SetStateAction<Employee | null>>;
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
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
  whatsappTemplates: WhatsAppTemplates;
  setWhatsappTemplates: (templates: WhatsAppTemplates) => void;
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

  const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplates = {
    lead_interest: "Olá, {{firstName}}! Tudo bem? Vi que você tem interesse em: *{{interest}}*. Gostaríamos de conversar sobre algumas opções que temos disponíveis!",
    lead_noInterest: "Olá, {{firstName}}! Tudo bem? Em que podemos te ajudar hoje? Temos diversas opções na loja que podem te interessar!",
    negociando_interest: "Olá, {{firstName}}! Tudo bem? Gostaria de saber se você conseguiu pensar na nossa proposta sobre o *{{interest}}*? Qualquer dúvida estou à disposição.",
    negociando_noInterest: "Olá, {{firstName}}! Tudo bem? Como estão as coisas? Gostaria de tirar alguma dúvida sobre as opções que vimos?",
    cliente_interest: "Olá, {{firstName}}! Tudo bem? Como está a experiência com seu novo *{{interest}}*? Estamos à disposição para qualquer dúvida ou revisão!",
    cliente_noInterest: "Olá, {{firstName}}! Tudo bem? Lembramos de você por aqui! Como estão as coisas? Se precisar de alguma manutenção ou avaliação, nos avise."
  };

  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplates>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("@apexMotors:whatsappTemplates_v2");
      if (stored) return JSON.parse(stored);
    }
    return DEFAULT_WHATSAPP_TEMPLATES;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("@apexMotors:whatsappTemplates_v2", JSON.stringify(whatsappTemplates));
    }
  }, [whatsappTemplates]);

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
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Mock logged in user as Admin
  const [currentUser, setCurrentUser] = useState<Employee | null>({
    id: 'user-1',
    name: 'Admin Teste',
    email: 'admin@apexmotors.com',
    role: 'Admin',
    createdAt: new Date().toISOString()
  });

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
      currentUser, setCurrentUser,
      employees, setEmployees,
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

      currentUser,
      activeClient,
      setActiveClient,
      activeExpense,
      setActiveExpense,
      whatsappTemplates,
      setWhatsappTemplates
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
