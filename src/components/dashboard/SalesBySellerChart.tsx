import { Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency } from "../../utils";

export type SalesBySellerDatum = {
  name: string;
  Vendas: number;
  Receita: number;
  Lucro: number;
};

interface SalesBySellerChartProps {
  data: SalesBySellerDatum[];
}

export function SalesBySellerChart({ data }: SalesBySellerChartProps) {
  return (
    <div className="lg:col-span-6 bg-white border border-stone-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <Users size={20} />
        </div>
        <div>
          <h2 className="font-bold text-stone-800 text-lg">Vendas por Vendedor</h2>
          <p className="text-sm text-stone-500">Ranking e performance de equipe</p>
        </div>
      </div>
      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-stone-400 font-medium text-sm">Sem vendas neste período</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} tickFormatter={(val) => `R$${val/1000}k`} dy={10} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} dx={-10} width={100} />
              <RechartsTooltip 
                cursor={{fill: '#f5f5f4', opacity: 0.5}} 
                contentStyle={{borderRadius: '16px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                formatter={(value?: ValueType) => formatCurrency(Number(value) || 0)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="Receita" name="Receita" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={20} />
              <Bar dataKey="Lucro" name="Lucro Líquido" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
