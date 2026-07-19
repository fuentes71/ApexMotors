export type Category = "Mecânica" | "Funilaria" | "Marketing" | "Documentação" | "Outros";

export type RecurrenceType = "Única" | "Diária" | "Semanal" | "Quinzenal" | "Mensal" | "Anual";

export type Expense = {
  id?: string;
  name: string;
  value: number;
  unitValue?: number;
  category?: Category;
  image?: string;
  recurrence?: RecurrenceType;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (if empty, it's a continuous fixed expense)
  linkedVehicleId?: string;
  addToMonthly?: boolean;
  dueDate?: string;
  isPaid?: boolean;
  receiptUrl?: string;
  paymentDate?: string;
};



export interface Client {
  id?: string;
  name: string;
  phone: string;
  email: string;
  status: 'Lead' | 'Frio' | 'Negociando' | 'Cliente' | 'Fechado';
  interest: string;
  notes: string;
  createdAt: string;
}

export interface VehicleDebt {
  id?: string;
  type: 'IPVA' | 'Licenciamento' | 'Multa';
  amount: number;
  dueDate: string;
  description: string;
}

export type Vehicle = {
  id?: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  purchaseValue: number | null;
  saleValue: number | null;
  expenses: Expense[];
  status: "Em Estoque" | "Manutenção" | "Vendido";
  entryDate: string;
  saleDate?: string;
  licensePlate?: string;
  renavam?: string;
  debts?: VehicleDebt[];
  buyerName?: string;
  buyerDoc?: string;
};

export type Role = "Admin" | "Seller" | "Accounting";

export interface Employee {
  id?: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface WhatsAppTemplates {
  lead_interest: string;
  lead_noInterest: string;
  negociando_interest: string;
  negociando_noInterest: string;
  cliente_interest: string;
  cliente_noInterest: string;
}
