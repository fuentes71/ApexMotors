import { CarFront, CheckCircle2, Trash2, ChevronRight, Plus, ImageIcon } from "lucide-react";
import { formatCurrency, DEFAULT_CAR_IMAGE } from "../utils";
import { Vehicle } from "../types";

interface InventoryViewProps {
  filteredVehicles: Vehicle[];
  vehicles: Vehicle[];
  setVehicles: (v: Vehicle[]) => void;
  setActiveVehicle: (v: Vehicle) => void;
  handleAddVehicle: () => void;
}

export function InventoryView({
  filteredVehicles, vehicles, setVehicles, setActiveVehicle, handleAddVehicle
}: InventoryViewProps) {
  return (
    <section className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
          <CarFront size={20} className="text-stone-500" />
          Veículos do Período
        </h2>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 font-medium">Veículo</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium hidden sm:table-cell">Custo Total</th>
                <th className="py-4 px-6 font-medium">Lucro Líquido</th>
                <th className="py-4 px-6 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 text-sm">
                    Nenhum veículo movimentado ou em estoque neste mês.
                  </td>
                </tr>
              )}
              {filteredVehicles.map(v => {
                const expenses = v.despesas.reduce((acc, e) => acc + e.value, 0);
                const totalCost = v.valorCompra + expenses;
                const profit = v.valorVenda - totalCost;
                
                return (
                  <tr 
                    key={v.id}
                    onClick={() => setActiveVehicle(v)}
                    className="hover:bg-stone-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-stone-200 relative">
                          <img src={v.image || DEFAULT_CAR_IMAGE} alt={v.name} className={`w-full h-full object-cover ${v.status === 'Vendido' ? 'grayscale opacity-70' : ''}`} />
                          {v.status === 'Vendido' && (
                            <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center">
                              <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-sm" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-stone-800 truncate text-sm">{v.name}</h3>
                          <p className="text-xs text-stone-500 truncate max-w-[150px] sm:max-w-[200px]">{v.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {v.status === 'Vendido' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={12} /> Vendido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600">
                          Em Estoque
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-stone-600 hidden sm:table-cell">
                      {formatCurrency(totalCost)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className={`font-semibold text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(profit)}
                        </span>
                        <span className="text-[10px] text-stone-400 uppercase font-medium">
                          {v.status === 'Vendido' ? 'Realizado' : 'Estimado'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setVehicles(vehicles.filter(ve => ve.id !== v.id));
                          }}
                          className="text-stone-300 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all print:hidden"
                          title="Excluir Veículo"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={18} className="text-stone-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-4 fade-in print:hidden">
        <div className="relative group">
          <button 
            onClick={handleAddVehicle}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/40 transition-all hover:scale-110 active:scale-95"
          >
            <Plus size={24} />
          </button>
          <div className="absolute bottom-full mb-3 right-0 bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Novo Veículo
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-stone-900"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
