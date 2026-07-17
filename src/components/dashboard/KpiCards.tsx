import { TrendingUp, Activity, CheckCircle2, Clock, Tag } from "lucide-react";
import { formatCurrency } from "../../utils";
import { TrendIndicator } from "./TrendIndicator";

interface KpiCardsProps {
  avgProfit: number;
  avgTicket: number;
  prevAvgTicket: number;
  avgStockDays: number;
  prevAvgStockDays: number;
  inStockVehiclesCount: number;
  soldVehiclesCount: number;
}

export function KpiCards({
  avgProfit, avgTicket, prevAvgTicket, avgStockDays, prevAvgStockDays, inStockVehiclesCount, soldVehiclesCount
}: KpiCardsProps) {
  const kpis = [
    { icon: TrendingUp, color: "emerald", title: "Lucro Médio/Carro", value: formatCurrency(avgProfit), subtitle: "Veículos vendidos", ind: null },
    { icon: Tag, color: "indigo", title: "Ticket Médio", value: formatCurrency(avgTicket), subtitle: "Média de venda", ind: <TrendIndicator current={avgTicket} prev={prevAvgTicket} /> },
    { icon: Clock, color: "rose", title: "Giro de Estoque", value: `${avgStockDays.toFixed(0)} dias`, subtitle: "Tempo médio", ind: <TrendIndicator current={avgStockDays} prev={prevAvgStockDays} invertColors /> },
    { icon: Activity, color: "blue", title: "Em Estoque", value: inStockVehiclesCount, subtitle: "No pátio hoje", ind: null },
    { icon: CheckCircle2, color: "purple", title: "Vendidos", value: soldVehiclesCount, subtitle: "Total finalizado", ind: null },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-xl group-hover:scale-110 transition-transform`}>
              <kpi.icon size={20} />
            </div>
            {kpi.ind}
          </div>
          <div>
            <p className="text-stone-500 font-medium text-sm mb-1">{kpi.title}</p>
            <h4 className="text-2xl font-bold text-stone-900 tracking-tight">{kpi.value}</h4>
            <p className="text-xs text-stone-400 mt-1">{kpi.subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
