import React from "react";
import { Wrench, Megaphone, FileText, Tag } from "lucide-react";

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
    case "Mecânica": return "bg-blue-50 text-blue-600 border-blue-200";
    case "Marketing": return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "Funilaria": return "bg-orange-50 text-orange-600 border-orange-200";
    case "Documentação": return "bg-purple-50 text-purple-600 border-purple-200";
    default: return "bg-stone-100 text-stone-600 border-stone-200";
  }
};

export const getCategoryIcon = (cat?: string) => {
  switch (cat) {
    case "Mecânica": return React.createElement(Wrench, { size: 12 });
    case "Marketing": return React.createElement(Megaphone, { size: 12 });
    case "Documentação": return React.createElement(FileText, { size: 12 });
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

export const calculateTotalFixedForPeriod = (expenses: any[], startMonth: string, endMonth: string): number => {
  let total = 0;

  const [ey, em] = endMonth.split('-');
  const rangeEnd = new Date(Number(ey), Number(em), 0, 23, 59, 59);

  expenses.forEach(exp => {
    if (!exp.startDate) {
      total += exp.value;
      return;
    }
    
    const [sy, sm, sd] = exp.startDate.split('-');
    let current = new Date(Number(sy), Number(sm) - 1, Number(sd), 12, 0, 0);

    let endBound = rangeEnd;
    if (exp.endDate) {
       const [edy, edm, edd] = exp.endDate.split('-');
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
      
      if (!exp.recurrence || exp.recurrence === "Única") {
        break;
      } else if (exp.recurrence === "Diária") {
        current.setDate(current.getDate() + 1);
      } else if (exp.recurrence === "Semanal") {
        current.setDate(current.getDate() + 7);
      } else if (exp.recurrence === "Quinzenal") {
        current.setDate(current.getDate() + 14);
      } else if (exp.recurrence === "Mensal") {
        current.setMonth(current.getMonth() + 1);
      } else if (exp.recurrence === "Anual") {
        current.setFullYear(current.getFullYear() + 1);
      } else {
        break;
      }
    }
  });

  return total;
};
