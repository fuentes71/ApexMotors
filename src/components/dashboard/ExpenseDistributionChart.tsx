import { PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "../../utils";

interface ExpenseDistributionChartProps {
  data: Record<string, unknown>[];
  colors: Record<string, string>;
}

export function ExpenseDistributionChart({ data, colors }: ExpenseDistributionChartProps) {
  const total = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  return (
    <div className="lg:col-span-6 bg-white border border-stone-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
          <PieIcon size={20} />
        </div>
        <h2 className="font-bold text-stone-800 text-lg">Despesas</h2>
      </div>
      <p className="text-sm text-stone-500 mb-6">Como os custos estão distribuídos</p>
      <div className="h-56 w-full relative flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.name as string]} />
              ))}
            </Pie>
            <RechartsTooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatCurrency(Number(value) || 0)}
              contentStyle={{borderRadius: '16px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-stone-400 text-xs font-medium">Total</span>
            <span className="text-stone-800 font-bold text-sm">
              {formatCurrency(total)}
            </span>
        </div>
      </div>
    </div>
  );
}
