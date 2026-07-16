export type Category = "Mecânica" | "Funilaria" | "Marketing" | "Documentação" | "Outros";

export type RecurrenceType = "Única" | "Diária" | "Semanal" | "Quinzenal" | "Mensal" | "Anual";

export type Expense = {
  id: string;
  name: string;
  value: number;
  category?: Category;
  image?: string;
  recurrence?: RecurrenceType;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (if empty, it's a continuous fixed expense)
  linkedVehicleId?: string;
  addToMonthly?: boolean;
};

export interface FixedExpense {
  id: string;
  name: string;
  value: number;
  dueDate: string;
  isPaid: boolean;
  category: "Aluguel" | "Salários" | "Impostos" | "Sistemas" | "Marketing" | "Outros";
  receiptUrl?: string; // NOVO: URL do comprovante (ex: blob:http://...)
  paymentDate?: string; // NOVO: data em que foi pago
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Lead' | 'Negociando' | 'Cliente';
  interest: string;
  notes: string;
  createdAt: string;
}

export interface VehicleDebt {
  id: string;
  type: 'IPVA' | 'Licenciamento' | 'Multa';
  amount: number;
  dueDate: string;
  description: string;
}

export type Vehicle = {
  id: string;
  name: string;
  description: string;
  image: string;
  galeria: string[];
  valorCompra: number;
  valorVenda: number;
  despesas: Expense[];
  status: "Em Estoque" | "Manutenção" | "Vendido";
  dataEntrada: string;
  dataVenda?: string;
  placa?: string;
  renavam?: string;
  debts?: VehicleDebt[];
  buyerName?: string;
  buyerDoc?: string;
};
