"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { Vehicle, Expense, Client, WhatsAppTemplates, Employee, Role } from "../types";
import { getTenantConfig, TenantConfig } from "../utils/tenantConfig";
import api, { authApi, setAuthToken, setTenantSlug } from "../services/api";
import { jwtDecode } from "jwt-decode";

interface DataContextType {
  tenantId: string;
  tenantConfig: TenantConfig;
  currentUser: Employee | null;
  setCurrentUser: Dispatch<SetStateAction<Employee | null>>;
  isLoadingAuth: boolean;
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
  activeEmployee: Employee | null;
  setActiveEmployee: (e: Employee | null) => void;
  fetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children, tenantId }: { children: ReactNode, tenantId: string }) {
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [tenantError, setTenantError] = useState(false);

  useEffect(() => {
    setTenantSlug(tenantId);

    const fetchTenant = async () => {
      try {
        const response = await api.get(`/tenants/${tenantId}`);
        setTenantConfig({
          id: response.data.slug,
          name: response.data.name,
          primaryColor: response.data.primaryColor || 'blue',
          logoUrl: response.data.logoUrl || '',
        });
      } catch (error) {
        console.error("Failed to fetch tenant:", error);
        setTenantError(true);
      }
    };
    fetchTenant();
  }, [tenantId]);

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

  // Authenticated user
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  const fetchData = async () => {
    try {
      const [vRes, eRes, cRes, empRes] = await Promise.allSettled([
        api.get('/vehicles'),
        api.get('/expenses'),
        api.get('/clients'),
        authApi.get('/users')
      ]);

      if (vRes.status === 'fulfilled') setVehicles(vRes.value.data);
      if (eRes.status === 'fulfilled') setFixedExpenses(eRes.value.data);
      if (cRes.status === 'fulfilled') setClients(cRes.value.data);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    // Check local storage for token on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('@apexMotors:token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setAuthToken(token);
          setCurrentUser({
            id: decoded.sub,
            name: decoded.name || 'User',
            email: decoded.email,
            role: decoded.role || 'Seller',
            createdAt: new Date().toISOString()
          });

          await fetchData();
        } catch (e) {
          console.error("Invalid token:", e);
          setAuthToken(null);
        }
      }
      setIsLoadingAuth(false);
    };
    if (tenantConfig) {
      checkAuth();
    }
  }, [tenantConfig]);

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (tenantError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200">
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">404</h1>
          <p className="text-stone-500 font-medium">Ambiente de trabalho ({tenantId}) não encontrado.</p>
        </div>
      </div>
    );
  }

  if (!tenantConfig) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{
      tenantId, tenantConfig,
      currentUser, setCurrentUser,
      isLoadingAuth,
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
      activeClient,
      setActiveClient,
      activeExpense,
      setActiveExpense,
      activeEmployee,
      setActiveEmployee,
      whatsappTemplates,
      setWhatsappTemplates,
      fetchData
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
