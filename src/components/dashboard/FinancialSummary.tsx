import { DollarSign, Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils";
import { TrendIndicator } from "./TrendIndicator";

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
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-3xl p-8 flex flex-col relative overflow-hidden group shadow-2xl shadow-stone-900/10 border border-stone-800">
        <div className="absolute -top-6 -right-6 p-4 opacity-5 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 ease-out pointer-events-none">
          <DollarSign size={160} />
        </div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Wallet className="text-stone-300" size={20} />
            </div>
            <h3 className="font-semibold text-stone-300 tracking-wide">Lucro Líquido</h3>
          </div>
          <TrendIndicator current={netBalance} prev={prevNetBalance} />
        </div>
        <p className="text-4xl lg:text-5xl font-bold text-white tracking-tight mt-2 relative z-10">{formatCurrency(netBalance)}</p>
        <p className="text-sm text-stone-400 mt-2">Saldo líquido do período atual</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl p-6 flex flex-col border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <PiggyBank size={20} />
              </div>
              <h3 className="font-semibold text-stone-600">Lucro Veículos</h3>
            </div>
            <TrendIndicator current={totalVehicleProfit} prev={prevTotalVehicleProfit} />
          </div>
          <p className="text-3xl font-bold text-stone-900 mt-3 tracking-tight">{formatCurrency(totalVehicleProfit)}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 flex flex-col border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                <TrendingUp size={20} className="rotate-180" />
              </div>
              <h3 className="font-semibold text-stone-600">Custos Fixos</h3>
            </div>
            <TrendIndicator current={totalFixed} prev={prevTotalFixed} invertColors />
          </div>
          <p className="text-3xl font-bold text-stone-900 mt-3 tracking-tight">{formatCurrency(totalFixed)}</p>
        </div>
      </div>
    </div>
  );
}
