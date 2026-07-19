import { TrendingUp, Activity, CheckCircle2, Clock, Tag } from "lucide-react";
import { formatCurrency } from "../../utils";
import { TrendIndicator } from "./TrendIndicator";
import { Tooltip } from "../ui/Tooltip";
import Link from "next/link";
import { useData } from "../../context/DataContext";

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
  const { tenantId } = useData();
  
  const kpis = [
    { icon: TrendingUp, color: "emerald", title: "Lucro Médio/Carro", value: formatCurrency(avgProfit), subtitle: "Veículos vendidos", ind: null, href: `/${tenantId}/vehicles` },
    { icon: Tag, color: "indigo", title: "Ticket Médio", value: formatCurrency(avgTicket), subtitle: "Média de venda", ind: <TrendIndicator current={avgTicket} prev={prevAvgTicket} />, href: `/${tenantId}/vehicles` },
    { icon: Clock, color: "rose", title: "Giro de Estoque", value: `${avgStockDays.toFixed(0)} dias`, subtitle: "Tempo médio", ind: <TrendIndicator current={avgStockDays} prev={prevAvgStockDays} invertColors />, href: `/${tenantId}/vehicles` },
    { icon: Activity, color: "blue", title: "Em Estoque", value: inStockVehiclesCount, subtitle: "No pátio hoje", ind: null, href: `/${tenantId}/vehicles` },
    { icon: CheckCircle2, color: "purple", title: "Vendidos", value: soldVehiclesCount, subtitle: "Total finalizado", ind: null, href: `/${tenantId}/vehicles` },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
      {kpis.map((kpi, i) => (
        <Link href={kpi.href} key={i} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between min-w-0 cursor-pointer hover:border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0`}>
              <kpi.icon size={20} />
            </div>
            {kpi.ind}
          </div>
          <div className="min-w-0 flex flex-col items-start w-full">
            <Tooltip content={kpi.title} position="top">
              <p className="text-stone-500 font-medium text-sm mb-1 w-full truncate">{kpi.title}</p>
            </Tooltip>
            <Tooltip content={String(kpi.value)} position="top">
              <h4 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight w-full truncate">{kpi.value}</h4>
            </Tooltip>
            <Tooltip content={kpi.subtitle} position="top">
              <p className="text-xs text-stone-400 mt-1 w-full truncate">{kpi.subtitle}</p>
            </Tooltip>
          </div>
        </Link>
      ))}
    </section>
  );
}
