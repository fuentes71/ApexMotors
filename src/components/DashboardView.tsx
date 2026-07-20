import { FinancialSummary } from "./dashboard/FinancialSummary";
import { SalesTrendChart } from "./dashboard/SalesTrendChart";
import { KpiCards } from "./dashboard/KpiCards";
import { VehicleAnalysisChart } from "./dashboard/VehicleAnalysisChart";
import { MonthlyComparisonChart } from "./dashboard/MonthlyComparisonChart";
import { ExpenseDistributionChart } from "./dashboard/ExpenseDistributionChart";
import { InventoryAging } from "./dashboard/InventoryAging";
import { SalesBySellerChart, type SalesBySellerDatum } from "./dashboard/SalesBySellerChart";

interface DashboardViewProps {
  netBalance: number;
  totalVehicleProfit: number;
  totalFixed: number;
  prevNetBalance: number;
  prevTotalVehicleProfit: number;
  prevTotalFixed: number;
  avgProfit: number;
  inStockVehiclesCount: number;
  soldVehiclesCount: number;
  barData: Record<string, unknown>[];
  pieData: Record<string, unknown>[];
  pieColors: Record<string, string>;
  avgTicket: number;
  prevAvgTicket: number;
  avgStockDays: number;
  prevAvgStockDays: number;
  salesTrendData: Record<string, unknown>[];
  inventoryAgingData: { name: string; count: number }[];
  salesBySellerData: SalesBySellerDatum[];
}

export function DashboardView({
  netBalance, totalVehicleProfit, totalFixed,
  prevNetBalance, prevTotalVehicleProfit, prevTotalFixed,
  avgProfit, inStockVehiclesCount, soldVehiclesCount, barData, pieData, pieColors,
  avgTicket, prevAvgTicket, avgStockDays, prevAvgStockDays,
  salesTrendData, inventoryAgingData, salesBySellerData
}: DashboardViewProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* SECTION 1: FINANCES & TRENDS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <FinancialSummary 
          netBalance={netBalance} prevNetBalance={prevNetBalance}
          totalVehicleProfit={totalVehicleProfit} prevTotalVehicleProfit={prevTotalVehicleProfit}
          totalFixed={totalFixed} prevTotalFixed={prevTotalFixed}
        />
        <SalesTrendChart data={salesTrendData} />
      </section>

      {/* SECTION 2: METRICS & KPI CARDS */}
      <KpiCards 
        avgProfit={avgProfit}
        avgTicket={avgTicket}
        prevAvgTicket={prevAvgTicket}
        avgStockDays={avgStockDays}
        prevAvgStockDays={prevAvgStockDays}
        inStockVehiclesCount={inStockVehiclesCount}
        soldVehiclesCount={soldVehiclesCount}
      />

      {/* SECTION 3: INVENTORY & EXPENSES DETAIL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <VehicleAnalysisChart data={barData} />
        <MonthlyComparisonChart data={salesTrendData} />
        <SalesBySellerChart data={salesBySellerData} />
        <ExpenseDistributionChart data={pieData} colors={pieColors} />
        <InventoryAging data={inventoryAgingData} inStockVehiclesCount={inStockVehiclesCount} />
      </section>
    </div>
  );
}
