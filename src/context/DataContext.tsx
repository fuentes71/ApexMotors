"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { Vehicle, Expense, Client, WhatsAppTemplates, Employee } from "../types";
import { TenantConfig } from "../utils/tenantConfig";
import api, { authApi, setTenantSlug, logout } from "../services/api";
import { io, Socket } from "socket.io-client";

interface DataContextType {
  tenantId: string;
  tenantConfig: TenantConfig;
  currentUser: Employee | null;
  setCurrentUser: Dispatch<SetStateAction<Employee | null>>;
  isLoadingAuth: boolean;
  loadError: boolean;
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
          cnpj: response.data.cnpj || '',
        });
      } catch (error) {
        console.error("Failed to fetch tenant:", error);
        setTenantError(true);
      }
    };
    fetchTenant();
  }, [tenantId]);

  const DEFAULT_CONTRACT_TEMPLATE = `Pelo presente instrumento, eu, {{buyerName}}, inscrito(a)
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
responsável a partir deste momento por quaisquer multas, impostos ou taxas.`;

  const [contractTemplate, setContractTemplate] = useState(DEFAULT_CONTRACT_TEMPLATE);

  const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplates = {
    lead_interest: "Olá, {{firstName}}! Tudo bem? Vi que você tem interesse em: *{{interest}}*. Gostaríamos de conversar sobre algumas opções que temos disponíveis!",
    lead_noInterest: "Olá, {{firstName}}! Tudo bem? Em que podemos te ajudar hoje? Temos diversas opções na loja que podem te interessar!",
    negociando_interest: "Olá, {{firstName}}! Tudo bem? Gostaria de saber se você conseguiu pensar na nossa proposta sobre o *{{interest}}*? Qualquer dúvida estou à disposição.",
    negociando_noInterest: "Olá, {{firstName}}! Tudo bem? Como estão as coisas? Gostaria de tirar alguma dúvida sobre as opções que vimos?",
    cliente_interest: "Olá, {{firstName}}! Tudo bem? Como está a experiência com seu novo *{{interest}}*? Estamos à disposição para qualquer dúvida ou revisão!",
    cliente_noInterest: "Olá, {{firstName}}! Tudo bem? Lembramos de você por aqui! Como estão as coisas? Se precisar de alguma manutenção ou avaliação, nos avise."
  };

  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplates>(DEFAULT_WHATSAPP_TEMPLATES);

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
  // True when a core list (vehicles, clients or expenses) failed to load, so
  // the UI can show an error instead of a plausible-looking empty account.
  const [loadError, setLoadError] = useState(false);

  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const [vRes, eRes, cRes, empRes, settingsRes] = await Promise.allSettled([
        api.get('/vehicles'),
        api.get('/expenses'),
        api.get('/clients'),
        authApi.get('/users'),
        api.get('/tenants/settings/me')
      ]);

      if (vRes.status === 'fulfilled') setVehicles(vRes.value.data);
      if (eRes.status === 'fulfilled') setFixedExpenses(eRes.value.data);
      if (cRes.status === 'fulfilled') setClients(cRes.value.data);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data);

      // If a core list failed, flag it so the UI does not read as an empty
      // account. Settings and employees are not counted as core here.
      if (
        vRes.status === 'rejected' ||
        eRes.status === 'rejected' ||
        cRes.status === 'rejected'
      ) {
        setLoadError(true);
      }

      if (settingsRes.status === 'fulfilled') {
        if (settingsRes.value.data.pdfTemplate) {
          setContractTemplate(settingsRes.value.data.pdfTemplate);
        }
        if (settingsRes.value.data.whatsappTemplates) {
          setWhatsappTemplates(settingsRes.value.data.whatsappTemplates);
        }
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setLoadError(true);
    }
  };

  useEffect(() => {
    // Ask the backend who we are. The httpOnly cookie can't be read in JS, so
    // /auth/me is the source of truth for the current session.
    const checkAuth = async () => {
      try {
        const { data: user } = await authApi.get('/auth/me');

        // Still logged in, but for a different tenant than the one in the URL
        // (the URL slug moved on without a fresh login). The backend would
        // still trust the tenantId in the cookie, so force an explicit logout.
        if (user.tenantSlug !== tenantId) {
          await logout();
          setCurrentUser(null);
          setIsLoadingAuth(false);
          return;
        }

        setCurrentUser({
          id: user.id,
          name: user.name || 'User',
          email: user.email,
          role: user.role || 'Seller',
          createdAt: new Date().toISOString()
        });

        await fetchData();
      } catch {
        // No valid session (401 or network error).
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    };
    if (tenantConfig) {
      checkAuth();
    }
  }, [tenantConfig]);

  // Real-time sync (BAS-40): while logged in, subscribe to this tenant's live
  // vehicle/client changes so concurrent sellers don't overwrite each other.
  // The socket connects DIRECTLY to the backend — WebSockets don't traverse the
  // Vercel same-origin rewrite — authenticated by a short-lived ticket fetched
  // over HTTP (the httpOnly cookie is sameSite=lax and wouldn't ride the
  // cross-site handshake). Realtime stays off if NEXT_PUBLIC_WS_URL is unset.
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
    if (!WS_URL || !currentUser) return;

    let cancelled = false;
    let socket: Socket | null = null;

    const getTicket = async (): Promise<string | null> => {
      try {
        const { data } = await api.get("/realtime/ticket");
        return data?.ticket ?? null;
      } catch {
        return null;
      }
    };

    (async () => {
      const ticket = await getTicket();
      if (cancelled || !ticket) return;
      socket = io(WS_URL, { auth: { ticket }, transports: ["websocket"] });

      // The ticket is short-lived; hand a fresh one to each reconnect attempt.
      socket.io.on("reconnect_attempt", async () => {
        const fresh = await getTicket();
        if (fresh && socket) socket.auth = { ticket: fresh };
      });

      socket.on(
        "vehicle_updated",
        (p: { action: "upsert" | "delete"; id: string; data?: Vehicle }) => {
          setVehicles((prev) => {
            if (p.action === "delete") return prev.filter((v) => v.id !== p.id);
            if (!p.data) return prev;
            return prev.some((v) => v.id === p.id)
              ? prev.map((v) => (v.id === p.id ? (p.data as Vehicle) : v))
              : [p.data as Vehicle, ...prev];
          });
        },
      );

      socket.on(
        "client_updated",
        (p: { action: "upsert" | "delete"; id: string; data?: Client }) => {
          setClients((prev) => {
            if (p.action === "delete") return prev.filter((c) => c.id !== p.id);
            if (!p.data) return prev;
            return prev.some((c) => c.id === p.id)
              ? prev.map((c) => (c.id === p.id ? (p.data as Client) : c))
              : [p.data as Client, ...prev];
          });
        },
      );
    })();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, tenantId]);

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
      loadError,
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
