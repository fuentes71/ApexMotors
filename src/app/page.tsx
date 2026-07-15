"use client";

import { useData } from "../context/DataContext";
import { Header } from "../components/Header";
import { DashboardView } from "../components/DashboardView";
import { calculateTotalFixedForPeriod } from "../utils";

export default function DashboardPage() {
  const { vehicles, fixedExpenses, startMonth, endMonth } = useData();

  const filteredVehicles = vehicles.filter(v => {
    if (v.status === "Vendido" && v.dataVenda) {
      const vendaMonth = v.dataVenda.substring(0, 7);
      return vendaMonth >= startMonth && vendaMonth <= endMonth;
    }
    return v.dataEntrada <= `${endMonth}-31`;
  });

  const totalFixed = calculateTotalFixedForPeriod(fixedExpenses, startMonth, endMonth);
  
  const totalVehicleProfit = filteredVehicles.reduce((acc, v) => {
    if (v.status !== 'Vendido') return acc;
    const expenses = v.despesas.reduce((sum, e) => sum + e.value, 0);
    return acc + (v.valorVenda - v.valorCompra - expenses);
  }, 0);

  const netBalance = totalVehicleProfit - totalFixed;

  const soldVehiclesCount = filteredVehicles.filter(v => v.status === "Vendido").length;
  const inStockVehiclesCount = filteredVehicles.filter(v => v.status === "Em Estoque").length;
  
  const avgProfit = soldVehiclesCount > 0 
    ? filteredVehicles.filter(v => v.status === "Vendido").reduce((acc, v) => acc + (v.valorVenda - v.valorCompra - v.despesas.reduce((s, e) => s + e.value, 0)), 0) / soldVehiclesCount
    : 0;

  const expenseDistribution: Record<string, number> = {
    "Mecânica": 0,
    "Funilaria": 0,
    "Marketing": 0,
    "Documentação": 0,
    "Outros": 0,
    "Fixas": totalFixed
  };

  filteredVehicles.forEach(v => {
    v.despesas.forEach(exp => {
      if (exp.category && expenseDistribution[exp.category] !== undefined) {
        expenseDistribution[exp.category] += exp.value;
      } else {
        expenseDistribution["Outros"] += exp.value;
      }
    });
  });

  const pieData = Object.entries(expenseDistribution)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const pieColors: Record<string, string> = {
    "Mecânica": "#3b82f6",
    "Funilaria": "#f97316",
    "Marketing": "#10b981",
    "Documentação": "#a855f7",
    "Outros": "#78716c",
    "Fixas": "#e11d48"
  };

  const barData = filteredVehicles.map(v => {
    const expenses = v.despesas.reduce((acc, e) => acc + e.value, 0);
    return {
      name: v.name.length > 12 ? v.name.substring(0, 12) + "..." : v.name,
      Lucro: v.status === 'Vendido' ? (v.valorVenda - v.valorCompra - expenses) : 0,
      Despesas: expenses
    };
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto">
      <Header />
      <DashboardView
        netBalance={netBalance}
        totalVehicleProfit={totalVehicleProfit}
        totalFixed={totalFixed}
        soldVehiclesCount={soldVehiclesCount}
        inStockVehiclesCount={inStockVehiclesCount}
        avgProfit={avgProfit}
        pieData={pieData}
        pieColors={pieColors}
        barData={barData}
      />
    </div>
  );
}
