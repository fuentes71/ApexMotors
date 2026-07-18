import { CalendarDays } from "lucide-react";

interface InventoryAgingProps {
  data: { name: string; count: number }[];
  inStockVehiclesCount: number;
}

export function InventoryAging({ data, inStockVehiclesCount }: InventoryAgingProps) {
  return (
    <div className="lg:col-span-6 bg-white border border-stone-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <CalendarDays size={20} />
            </div>
            <h2 className="font-bold text-stone-800 text-lg">Idade do Estoque</h2>
          </div>
      </div>
      <p className="text-sm text-stone-500 mb-6">Tempo de permanência dos veículos no pátio</p>
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {data.map((item, i: number) => {
          const total = inStockVehiclesCount || 1;
          const percentage = Math.round((Number(item.count) / total) * 100);
          let barColor = "bg-emerald-500";
          if (i === 1) barColor = "bg-blue-500";
          if (i === 2) barColor = "bg-amber-500";
          if (i === 3) barColor = "bg-rose-500";
          
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm font-medium text-stone-600">
                <span>{item.name}</span>
                <span>{item.count} veíc. ({percentage}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
