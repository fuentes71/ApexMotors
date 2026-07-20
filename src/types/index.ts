export type Category = "Mechanics" | "Bodywork" | "Marketing" | "Documentation" | "Others";

export type RecurrenceType = "One-time" | "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Yearly";

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
  status: 'Lead' | 'Cold' | 'Negotiating' | 'Customer' | 'Closed';
  interest: string;
  notes: string;
  createdAt: string;
}

export interface VehicleDebt {
  id?: string;
  type: 'IPVA' | 'Licensing' | 'Fine';
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
  status: "In Stock" | "Maintenance" | "Sold";
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
  password?: string;
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
