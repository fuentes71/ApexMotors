import { BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from "../../utils";

interface VehicleAnalysisChartProps {
  data: Record<string, unknown>[];
}

export function VehicleAnalysisChart({ data }: VehicleAnalysisChartProps) {
  return (
    <div className="lg:col-span-6 bg-white border border-stone-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
          <BarChart2 size={20} />
        </div>
        <div>
          <h2 className="font-bold text-stone-800 text-lg">Análise por Veículo</h2>
          <p className="text-sm text-stone-500">Comparativo no estoque e vendidos</p>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} tickFormatter={(val) => `R$${val/1000}k`} dx={-10} />
            <RechartsTooltip 
              cursor={{fill: '#f5f5f4', opacity: 0.5}} 
              contentStyle={{borderRadius: '16px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatCurrency(Number(value) || 0)}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Bar dataKey="Lucro" name="Lucro Líquido" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Despesas" name="Custos / Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
