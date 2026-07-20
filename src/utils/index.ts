import React from "react";
import { Wrench, Megaphone, FileText, Tag } from "lucide-react";
import { Expense, Client, WhatsAppTemplates } from "../types";

export const RoleEnum: Record<string, string> = {
  Admin: 'Administrador',
  Seller: 'Vendedor',
  Accounting: 'Contabilidade'
};

export const VehicleStatusEnum: Record<string, string> = {
  "In Stock": "Em Estoque", 
  "Maintenance": "Manutenção", 
  "Sold": "Vendido"
};

export const ClientStatusEnum: Record<string, string> = {
  Lead: 'Lead',
  Cold: 'Frio',
  Negotiating: 'Negociando',
  Customer: 'Cliente',
  Closed: 'Fechado'
};

export const CategoryEnum: Record<string, string> = {
  "Mechanics": "Mecânica",
  "Bodywork": "Funilaria",
  "Marketing": "Marketing",
  "Documentation": "Documentação",
  "Others": "Outros"
};

export const RecurrenceEnum: Record<string, string> = {
  "One-time": "Única",
  "Daily": "Diária",
  "Weekly": "Semanal",
  "Biweekly": "Quinzenal",
  "Monthly": "Mensal",
  "Yearly": "Anual"
};

export const DebtTypeEnum: Record<string, string> = {
  "IPVA": "IPVA",
  "Licensing": "Licenciamento",
  "Fine": "Multa"
};
export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const DEFAULT_CAR_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80";

export const formatMonth = (yyyy_mm: string) => {
  const [y, m] = yyyy_mm.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' });
  const parts = formatter.formatToParts(date);
  const month = parts.find(p => p.type === 'month')?.value.replace('.', '') || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  return `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`;
};

export const getCategoryColor = (cat?: string) => {
  switch (cat) {
    case "Mechanics": return "bg-blue-50 text-blue-600 border-blue-200";
    case "Marketing": return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "Bodywork": return "bg-orange-50 text-orange-600 border-orange-200";
    case "Documentation": return "bg-purple-50 text-purple-600 border-purple-200";
    default: return "bg-stone-100 text-stone-600 border-stone-200";
  }
};

export const getCategoryIcon = (cat?: string) => {
  switch (cat) {
    case "Mechanics": return React.createElement(Wrench, { size: 12 });
    case "Marketing": return React.createElement(Megaphone, { size: 12 });
    case "Documentation": return React.createElement(FileText, { size: 12 });
    default: return React.createElement(Tag, { size: 12 });
  }
};

export const getDaysDifference = (startStr: string, endStr?: string) => {
  if (!startStr) return 0;
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays >= 0 ? diffDays : 0;
};

export const calculateTotalFixedForPeriod = (expenses: Expense[], startMonth: string, endMonth: string): number => {
  let total = 0;

  const [ey, em] = endMonth.split('-');
  const rangeEnd = new Date(Number(ey), Number(em), 0, 23, 59, 59);

  expenses.forEach(exp => {
    if (!exp.startDate) {
      total += exp.value;
      return;
    }
    
    const [sy, sm, sd] = exp.startDate.split('T')[0].split('-');
    const current = new Date(Number(sy), Number(sm) - 1, Number(sd), 12, 0, 0);

    let endBound = rangeEnd;
    if (exp.endDate) {
       const [edy, edm, edd] = exp.endDate.split('T')[0].split('-');
       endBound = new Date(Number(edy), Number(edm) - 1, Number(edd), 23, 59, 59);
    }
    const maxDate = endBound > rangeEnd ? rangeEnd : endBound;

    let iterations = 0;
    while (current <= maxDate && iterations < 10000) {
      iterations++;
      

      const currentMonthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      
      if (currentMonthStr >= startMonth && currentMonthStr <= endMonth) {
        total += exp.value;
      }
      
      let recurrence = exp.recurrence;


      if (!recurrence || recurrence === "One-time") {
        break;
      } else if (recurrence === "Daily") {
        current.setDate(current.getDate() + 1);
      } else if (recurrence === "Weekly") {
        current.setDate(current.getDate() + 7);
      } else if (recurrence === "Biweekly") {
        current.setDate(current.getDate() + 14);
      } else if (recurrence === "Monthly") {
        const expectedMonth = (current.getMonth() + 1) % 12;
        current.setMonth(current.getMonth() + 1);
        if (current.getMonth() !== expectedMonth) {
          current.setDate(0);
        }
      } else if (recurrence === "Yearly") {
        const expectedMonth = current.getMonth();
        current.setFullYear(current.getFullYear() + 1);
        if (current.getMonth() !== expectedMonth) {
          current.setDate(0);
        }
      } else {
        break;
      }

    }
  });

  return total;
};

export const generateWhatsAppLink = (client: Client, withMessage: boolean = true, templates?: WhatsAppTemplates): string => {
  if (!client.phone) return '';
  const cleanPhone = client.phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.length === 11 || cleanPhone.length === 10 ? `55${cleanPhone}` : cleanPhone;
  
  if (!withMessage) {
    return `https://wa.me/${fullPhone}`;
  }

  const firstName = client.name ? client.name.split(' ')[0] : 'amigo(a)';
  let message = '';

  if (templates) {
    const renderTemplate = (text: string) => {
      return text
        .replace(/\{\{interest\}\}/g, client.interest || '')
        .replace(/\{\{firstName\}\}/g, firstName);
    };
    
    if (client.status === 'Lead' || client.status === 'Cold') {
      if (client.interest) {
        message = renderTemplate(templates.lead_interest);
      } else {
        message = renderTemplate(templates.lead_noInterest);
      }
    } else if (client.status === 'Negotiating') {
      if (client.interest) {
        message = renderTemplate(templates.negociando_interest);
      } else {
        message = renderTemplate(templates.negociando_noInterest);
      }
    } else if (client.status === 'Customer' || client.status === 'Closed') {
      if (client.interest) {
        message = renderTemplate(templates.cliente_interest);
      } else {
        message = renderTemplate(templates.cliente_noInterest);
      }
    } else {
      if (client.interest) {
        message = `Olá, ${firstName}! Vi que você tem interesse em: *${client.interest}*. Gostaríamos de conversar!`;
      } else {
        message = `Olá, ${firstName}!`;
      }
    }
  } else {
    // Fallback if templates are not provided
    message = `Olá, ${firstName}! Tudo bem?`;
    if (client.status === 'Lead' || client.status === 'Cold') {
      if (client.interest) {
        message += ` Vi que você tem interesse em: *${client.interest}*. Gostaríamos de conversar sobre algumas opções que temos disponíveis!`;
      } else {
        message += ` Em que podemos te ajudar hoje? Temos diversas opções na loja que podem te interessar!`;
      }
    } else if (client.status === 'Negotiating') {
      if (client.interest) {
        message += ` Gostaria de saber se você conseguiu pensar na nossa proposta sobre o *${client.interest}*? Qualquer dúvida estou à disposição.`;
      } else {
        message += ` Como estão as coisas? Gostaria de tirar alguma dúvida sobre as opções que vimos?`;
      }
    } else if (client.status === 'Customer' || client.status === 'Closed') {
      if (client.interest) {
        message += ` Como está a experiência com seu novo *${client.interest}*? Estamos à disposição para qualquer dúvida ou revisão!`;
      } else {
        message += ` Lembramos de você por aqui! Como estão as coisas? Se precisar de alguma manutenção ou avaliação, nos avise.`;
      }
    } else {
      if (client.interest) {
        message += ` Vi que você tem interesse em: *${client.interest}*. Gostaríamos de conversar!`;
      }
    }
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
};

export const toISODate = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return dateStr;
  return `${dateStr}T12:00:00.000Z`;
};
