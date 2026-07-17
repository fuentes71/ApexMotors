/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendingUp, Activity, CheckCircle2, BarChart2, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, PiggyBank, Clock, Tag, LineChart as LineIcon, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { formatCurrency } from "../utils";

interface DashboardViewProps {
  netBalance: number;
  totalVehicleProfit: number;
  totalFixed: number;
  prevNetBalance: number;
  prevTotalVehicleProfit: number;
  prevTotalFixed: number;
  avgProfit: number;
  inStockVehiclesCount: number;
  soldVehiclesCount: number;
  barData: Record<string, unknown>[];
  pieData: Record<string, unknown>[];
  pieColors: Record<string, string>;
  avgTicket: number;
  prevAvgTicket: number;
  avgStockDays: number;
  prevAvgStockDays: number;
  salesTrendData: Record<string, unknown>[];
  inventoryAgingData: Record<string, unknown>[];
}

export function DashboardView({
  netBalance, totalVehicleProfit, totalFixed,
  prevNetBalance, prevTotalVehicleProfit, prevTotalFixed,
  avgProfit, inStockVehiclesCount, soldVehiclesCount, barData, pieData, pieColors,
  avgTicket, prevAvgTicket, avgStockDays, prevAvgStockDays,
  salesTrendData, inventoryAgingData
}: DashboardViewProps) {
  
  const renderIndicator = (current: number, prev: number, invertColors = false) => {
    if (prev === 0 && current === 0) return null;
    const diff = current - prev;
    const isPositive = diff > 0;
    const isNegative = diff < 0;
    
    let colorClass = "text-stone-400 bg-stone-100/50";
    if (isPositive) {
      colorClass = invertColors ? "text-rose-600 bg-rose-50 border border-rose-100" : "text-emerald-600 bg-emerald-50 border border-emerald-100";
    } else if (isNegative) {
      colorClass = invertColors ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100";
    }

    let Icon = null;
    if (isPositive) Icon = ArrowUpRight;
    if (isNegative) Icon = ArrowDownRight;

    return (
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all ${colorClass}`}>
        {Icon && <Icon size={14} strokeWidth={3} />}
        {prev === 0 ? "Novo" : `${Math.abs((diff / Math.abs(prev)) * 100).toFixed(1)}%`}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* SECTION 1: FINANCES & TRENDS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Financial Summary */}
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
              {renderIndicator(netBalance, prevNetBalance)}
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
                {renderIndicator(totalVehicleProfit, prevTotalVehicleProfit)}
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
                {renderIndicator(totalFixed, prevTotalFixed, true)}
              </div>
              <p className="text-3xl font-bold text-stone-900 mt-3 tracking-tight">{formatCurrency(totalFixed)}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Trend Chart */}
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
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Area type="monotone" dataKey="Receita" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                <Area type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLucro)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* SECTION 2: METRICS & KPI CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
        {[
          { icon: TrendingUp, color: "emerald", title: "Lucro Médio/Carro", value: formatCurrency(avgProfit), subtitle: "Veículos vendidos", ind: null },
          { icon: Tag, color: "indigo", title: "Ticket Médio", value: formatCurrency(avgTicket), subtitle: "Média de venda", ind: renderIndicator(avgTicket, prevAvgTicket) },
          { icon: Clock, color: "rose", title: "Giro de Estoque", value: `${avgStockDays.toFixed(0)} dias`, subtitle: "Tempo médio", ind: renderIndicator(avgStockDays, prevAvgStockDays, true) },
          { icon: Activity, color: "blue", title: "Em Estoque", value: inStockVehiclesCount, subtitle: "No pátio hoje", ind: null },
          { icon: CheckCircle2, color: "purple", title: "Vendidos", value: soldVehiclesCount, subtitle: "Total finalizado", ind: null },
        ].map((kpi, i) => (
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

      {/* SECTION 3: INVENTORY & EXPENSES DETAIL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Barras: Lucro por Veículo */}
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
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} tickFormatter={(val) => `R$${val/1000}k`} dx={-10} />
                <RechartsTooltip 
                  cursor={{fill: '#f5f5f4', opacity: 0.5}} 
                  contentStyle={{borderRadius: '16px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Lucro" name="Lucro Líquido" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Despesas" name="Custos / Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Barras: Comparativo Mensal */}
        <div className="lg:col-span-6 bg-white border border-stone-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="font-bold text-stone-800 text-lg">Comparativo Mensal</h2>
              <p className="text-sm text-stone-500">Receita vs Lucro nos últimos 6 meses</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} tickFormatter={(val) => `R$${val/1000}k`} dx={-10} />
                <RechartsTooltip 
                  cursor={{fill: '#f5f5f4', opacity: 0.5}} 
                  contentStyle={{borderRadius: '16px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Receita" name="Receita Bruta" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Lucro" name="Lucro Líquido" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza: Distribuição de Despesas */}
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[entry.name as string]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{borderRadius: '16px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-stone-400 text-xs font-medium">Total</span>
                <span className="text-stone-800 font-bold text-sm">
                  {formatCurrency(pieData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0))}
                </span>
            </div>
          </div>
        </div>

        {/* Aging de Estoque */}
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
            {inventoryAgingData.map((item: any, i: number) => {
              const total = inStockVehiclesCount || 1;
              const percentage = Math.round((item.count / total) * 100);
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
      </section>
    </div>
  );
}
