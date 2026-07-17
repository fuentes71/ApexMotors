import { LineChart as LineIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from "../../utils";

interface SalesTrendChartProps {
  data: Record<string, unknown>[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <div className="lg:col-span-8 bg-white rounded-3xl p-6 flex flex-col border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <LineIcon size={20} />
          </div>
          <div>
            <h2 className="font-bold text-stone-800 text-lg">Desempenho de Vendas</h2>
            <p className="text-sm text-stone-500">Receita e Lucro dos últimos 6 meses</p>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} tickFormatter={(val) => `R$${val/1000}k`} dx={-10} />
            <RechartsTooltip 
              cursor={{stroke: '#e7e5e4', strokeWidth: 1, strokeDasharray: '4 4'}} 
              contentStyle={{borderRadius: '16px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatCurrency(Number(value) || 0)}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Area type="monotone" dataKey="Receita" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
            <Area type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLucro)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
