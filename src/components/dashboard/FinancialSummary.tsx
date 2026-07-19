import { DollarSign, Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils";
import { TrendIndicator } from "./TrendIndicator";
import { Tooltip } from "../ui/Tooltip";
import Link from "next/link";
import { useData } from "../../context/DataContext";

interface FinancialSummaryProps {
  netBalance: number;
  prevNetBalance: number;
  totalVehicleProfit: number;
  prevTotalVehicleProfit: number;
  totalFixed: number;
  prevTotalFixed: number;
}

export function FinancialSummary({
  netBalance, prevNetBalance, 
  totalVehicleProfit, prevTotalVehicleProfit, 
  totalFixed, prevTotalFixed
}: FinancialSummaryProps) {
  const { tenantId } = useData();

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      <Link href={`/${tenantId}/finance`} className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-3xl p-8 flex flex-col relative overflow-hidden group shadow-2xl shadow-stone-900/10 border border-stone-800 min-w-0 cursor-pointer hover:border-stone-600 transition-colors">
        <div className="absolute -top-6 -right-6 p-4 opacity-5 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 ease-out pointer-events-none">
          <DollarSign size={160} />
        </div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3 w-full min-w-0 pr-4">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md flex-shrink-0">
              <Wallet className="text-stone-300" size={20} />
            </div>
            <Tooltip content="Lucro Líquido" position="top">
              <h3 className="font-semibold text-stone-300 tracking-wide truncate w-full">Lucro Líquido</h3>
            </Tooltip>
          </div>
          <TrendIndicator current={netBalance} prev={prevNetBalance} />
        </div>
        <div className="w-full flex items-start flex-col relative z-10 min-w-0">
          <Tooltip content={formatCurrency(netBalance)} position="top">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mt-2 w-full truncate">{formatCurrency(netBalance)}</p>
          </Tooltip>
          <Tooltip content="Saldo líquido do período atual" position="top">
            <p className="text-sm text-stone-400 mt-2 w-full truncate">Saldo líquido do período atual</p>
          </Tooltip>
        </div>
      </Link>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        <Link href={`/${tenantId}/vehicles`} className="bg-white rounded-3xl p-6 flex flex-col border border-stone-100 shadow-sm hover:shadow-md transition-shadow min-w-0 cursor-pointer hover:border-blue-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3 w-full min-w-0 pr-4">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
                <PiggyBank size={20} />
              </div>
              <Tooltip content="Lucro Veículos" position="top">
                <h3 className="font-semibold text-stone-600 truncate w-full">Lucro Veículos</h3>
              </Tooltip>
            </div>
            <TrendIndicator current={totalVehicleProfit} prev={prevTotalVehicleProfit} />
          </div>
          <div className="w-full min-w-0 flex">
            <Tooltip content={formatCurrency(totalVehicleProfit)} position="top">
              <p className="text-2xl sm:text-3xl font-bold text-stone-900 mt-3 tracking-tight truncate w-full">{formatCurrency(totalVehicleProfit)}</p>
            </Tooltip>
          </div>
        </Link>

        <Link href={`/${tenantId}/finance`} className="bg-white rounded-3xl p-6 flex flex-col border border-stone-100 shadow-sm hover:shadow-md transition-shadow min-w-0 cursor-pointer hover:border-blue-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3 w-full min-w-0 pr-4">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600 flex-shrink-0">
                <TrendingUp size={20} className="rotate-180" />
              </div>
              <Tooltip content="Custos Fixos" position="top">
                <h3 className="font-semibold text-stone-600 truncate w-full">Custos Fixos</h3>
              </Tooltip>
            </div>
            <TrendIndicator current={totalFixed} prev={prevTotalFixed} invertColors />
          </div>
          <div className="w-full min-w-0 flex">
            <Tooltip content={formatCurrency(totalFixed)} position="top">
              <p className="text-2xl sm:text-3xl font-bold text-stone-900 mt-3 tracking-tight truncate w-full">{formatCurrency(totalFixed)}</p>
            </Tooltip>
          </div>
        </Link>
      </div>
    </div>
  );
}
