import { TrendingUp, Activity, CheckCircle2, BarChart2, PieChart as PieIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency } from "../utils";

interface DashboardViewProps {
  avgProfit: number;
  inStockVehiclesCount: number;
  soldVehiclesCount: number;
  barData: any[];
  pieData: any[];
  pieColors: Record<string, string>;
}

export function DashboardView({
  avgProfit, inStockVehiclesCount, soldVehiclesCount, barData, pieData, pieColors
}: DashboardViewProps) {
  return (
    <>
      {/* KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp size={20} /></div>
            <h3 className="font-semibold text-stone-700">Lucro Médio/Carro</h3>
          </div>
          <p className="text-3xl font-bold text-stone-900 mt-2">{formatCurrency(avgProfit)}</p>
          <p className="text-xs text-stone-400 mt-2">Apenas de veículos vendidos</p>
        </div>
        
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><Activity size={20} /></div>
            <h3 className="font-semibold text-stone-700">Em Estoque</h3>
          </div>
          <p className="text-3xl font-bold text-stone-900 mt-2">{inStockVehiclesCount}</p>
          <p className="text-xs text-stone-400 mt-2">Veículos no pátio atualmente</p>
        </div>
        
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg"><CheckCircle2 size={20} /></div>
            <h3 className="font-semibold text-stone-700">Vendidos</h3>
          </div>
          <p className="text-3xl font-bold text-stone-900 mt-2">{soldVehiclesCount}</p>
          <p className="text-xs text-stone-400 mt-2">Veículos já finalizados</p>
        </div>
      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Barras: Lucro por Veículo */}
        <div className="lg:col-span-8 bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 text-stone-800">
            <BarChart2 size={20} className="text-blue-500" />
            <h2 className="font-semibold text-lg">Lucro x Despesas por Veículo</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} tickFormatter={(val) => `R$${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f5f5f4'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Lucro" name="Lucro Líquido" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Despesas" name="Custos/Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza: Distribuição de Despesas */}
        <div className="lg:col-span-4 bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2 text-stone-800">
            <PieIcon size={20} className="text-purple-500" />
            <h2 className="font-semibold text-lg">Onde seu dinheiro vai?</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">Distribuição de todas as despesas</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[entry.name]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-stone-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: pieColors[entry.name]}}></div>
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
