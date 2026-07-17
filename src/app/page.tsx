"use client";

import { useData } from "../context/DataContext";
import { Header } from "../components/Header";
import { DashboardView } from "../components/DashboardView";
import { calculateTotalFixedForPeriod } from "../utils";
import { getPreviousPeriod } from "../utils/period";

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

  // Previous Period Calculations
  const { prevStart, prevEnd } = getPreviousPeriod(startMonth, endMonth);
  
  const prevFilteredVehicles = vehicles.filter(v => {
    if (v.status === "Vendido" && v.dataVenda) {
      const vendaMonth = v.dataVenda.substring(0, 7);
      return vendaMonth >= prevStart && vendaMonth <= prevEnd;
    }
    return v.dataEntrada <= `${prevEnd}-31`;
  });

  const prevTotalFixed = calculateTotalFixedForPeriod(fixedExpenses, prevStart, prevEnd);
  
  const prevTotalVehicleProfit = prevFilteredVehicles.reduce((acc, v) => {
    if (v.status !== 'Vendido') return acc;
    const expenses = v.despesas.reduce((sum, e) => sum + e.value, 0);
    return acc + (v.valorVenda - v.valorCompra - expenses);
  }, 0);

  const prevNetBalance = prevTotalVehicleProfit - prevTotalFixed;

  const soldVehiclesCount = filteredVehicles.filter(v => v.status === "Vendido").length;
  const inStockVehiclesCount = filteredVehicles.filter(v => v.status === "Em Estoque" || v.status === "Manutenção").length;
  const soldVehicles = filteredVehicles.filter(v => v.status === "Vendido");
  const prevSoldVehicles = prevFilteredVehicles.filter(v => v.status === "Vendido");
  
  const avgProfit = soldVehiclesCount > 0 
    ? soldVehicles.reduce((acc, v) => acc + (v.valorVenda - v.valorCompra - v.despesas.reduce((s, e) => s + e.value, 0)), 0) / soldVehiclesCount
    : 0;

  const avgTicket = soldVehiclesCount > 0
    ? soldVehicles.reduce((acc, v) => acc + v.valorVenda, 0) / soldVehiclesCount
    : 0;

  const prevAvgTicket = prevSoldVehicles.length > 0
    ? prevSoldVehicles.reduce((acc, v) => acc + v.valorVenda, 0) / prevSoldVehicles.length
    : 0;

  const calculateDays = (entrada: string, venda: string) => {
    const diff = new Date(venda).getTime() - new Date(entrada).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const avgStockDays = soldVehiclesCount > 0
    ? soldVehicles.reduce((acc, v) => acc + calculateDays(v.dataEntrada, v.dataVenda!), 0) / soldVehiclesCount
    : 0;

  const prevAvgStockDays = prevSoldVehicles.length > 0
    ? prevSoldVehicles.reduce((acc, v) => acc + calculateDays(v.dataEntrada, v.dataVenda!), 0) / prevSoldVehicles.length
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

  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    return d.toISOString().substring(0, 7); // YYYY-MM
  });

  const salesTrendData = last6Months.map(monthStr => {
    const monthVehicles = vehicles.filter(v => v.status === "Vendido" && v.dataVenda?.startsWith(monthStr));
    const revenue = monthVehicles.reduce((acc, v) => acc + v.valorVenda, 0);
    const profit = monthVehicles.reduce((acc, v) => acc + (v.valorVenda - v.valorCompra - v.despesas.reduce((s, e) => s + e.value, 0)), 0);
    return {
      name: monthStr.substring(5, 7) + "/" + monthStr.substring(2, 4),
      Receita: revenue,
      Lucro: profit
    };
  });

  const inventoryAgingData = [
    { name: "0-30 dias", count: 0 },
    { name: "31-60 dias", count: 0 },
    { name: "61-90 dias", count: 0 },
    { name: "+90 dias", count: 0 },
  ];

  vehicles.filter(v => v.status !== "Vendido").forEach(v => {
    const days = calculateDays(v.dataEntrada, new Date().toISOString());
    if (days <= 30) inventoryAgingData[0].count++;
    else if (days <= 60) inventoryAgingData[1].count++;
    else if (days <= 90) inventoryAgingData[2].count++;
    else inventoryAgingData[3].count++;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto bg-[#FAFAFA]">
      <Header />
      <div className="px-4 lg:px-8 max-w-7xl mx-auto w-full pt-6 pb-12">
        <DashboardView
          netBalance={netBalance}
          totalVehicleProfit={totalVehicleProfit}
          totalFixed={totalFixed}
          prevNetBalance={prevNetBalance}
          prevTotalVehicleProfit={prevTotalVehicleProfit}
          prevTotalFixed={prevTotalFixed}
          soldVehiclesCount={soldVehiclesCount}
          inStockVehiclesCount={inStockVehiclesCount}
          avgProfit={avgProfit}
          pieData={pieData}
          pieColors={pieColors}
          barData={barData}
          avgTicket={avgTicket}
          prevAvgTicket={prevAvgTicket}
          avgStockDays={avgStockDays}
          prevAvgStockDays={prevAvgStockDays}
          salesTrendData={salesTrendData}
          inventoryAgingData={inventoryAgingData}
        />
      </div>
    </div>
  );
}
