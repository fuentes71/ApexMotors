import { CarFront, CheckCircle2, Trash2, ChevronRight, Plus, AlertTriangle, ChevronDown, Edit2, Wrench, Loader2, FileText, Search, Download, Calendar, Tag, X, AlertCircle } from "lucide-react";
import { formatCurrency, DEFAULT_CAR_IMAGE } from "../utils";
import { Vehicle } from "../types";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { useSort } from "../hooks/useSort";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { generateContractPDF } from "../utils/pdfExport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import { ViewLayout } from "./ui/ViewLayout";
import api from "../services/api";

interface InventoryViewProps {
  filteredVehicles: Vehicle[];
  vehicles: Vehicle[];
  setVehicles: (v: Vehicle[]) => void;
  setActiveVehicle: (v: Vehicle) => void;
  handleAddVehicle: () => Promise<void> | void;
}

export function InventoryView({
  filteredVehicles, vehicles, setVehicles, setActiveVehicle, handleAddVehicle
}: InventoryViewProps) {
  const { fixedExpenses, setFixedExpenses, contractTemplate, setFullscreenImage } = useData();
  const { showToast } = useToast();

  const [sellingVehicle, setSellingVehicle] = useState<Vehicle | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerDoc, setBuyerDoc] = useState("");
  const [isSelling, setIsSelling] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  const displayVehicles = filteredVehicles.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.placa && v.placa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const { sortColumn, sortDirection, handleSort, sortedData: sortedVehicles } = useSort(displayVehicles, {
    cost: (a, b) => {
      const costA = a.valorCompra + a.despesas.reduce((acc, e) => acc + e.value, 0);
      const costB = b.valorCompra + b.despesas.reduce((acc, e) => acc + e.value, 0);
      return costA - costB;
    },
    profit: (a, b) => {
      const costA = a.valorCompra + a.despesas.reduce((acc, e) => acc + e.value, 0);
      const profitA = a.valorVenda - costA;
      
      const costB = b.valorCompra + b.despesas.reduce((acc, e) => acc + e.value, 0);
      const profitB = b.valorVenda - costB;
      
      return profitA - profitB;
    }
  });

  const handleStatusChange = async (v: Vehicle, newStatus: string) => {
    if (newStatus === 'Vendido') {
      setSellingVehicle(v);
      setBuyerName(v.buyerName || "");
      setBuyerDoc(v.buyerDoc || "");
    } else {
      const updatedV = { ...v, status: newStatus as Vehicle['status'], dataVenda: undefined, buyerName: undefined, buyerDoc: undefined };
      try {
        const res = await api.put(`/vehicles/${v.id}`, updatedV);
        setVehicles(vehicles.map(vh => vh.id === v.id ? res.data : vh));
        showToast("Status alterado com sucesso!", "success");
      } catch(e) {
        console.error(e);
        showToast("Erro ao alterar status", "error");
        setVehicles(vehicles.map(vh => vh.id === v.id ? updatedV : vh));
      }
    }
  };

  const confirmSale = async (generatePDF: boolean) => {
    if (!sellingVehicle) return;
    setIsSelling(true);
    const updatedV = { 
      ...sellingVehicle, 
      status: 'Vendido' as const, 
      dataVenda: new Date().toISOString().split('T')[0],
      buyerName,
      buyerDoc
    };
    
    try {
      const res = await api.put(`/vehicles/${sellingVehicle.id}`, updatedV);
      setVehicles(vehicles.map(vh => vh.id === sellingVehicle.id ? res.data : vh));
      showToast("Veículo vendido!", "success");
    } catch(e) {
      console.error(e);
      setVehicles(vehicles.map(vh => vh.id === sellingVehicle.id ? updatedV : vh));
      showToast("Venda salva offline", "warning");
    } finally {
      setIsSelling(false);
    }
    
    if (generatePDF) {
      generateContractPDF(updatedV, contractTemplate);
    }
    
    setSellingVehicle(null);
  };

  return (
    <section className="w-full">
      <ViewLayout
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por veículo ou placa..."
        pagination={{
          currentPage,
          totalPages: Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE),
          onPageChange: setCurrentPage
        }}
        floatingAction={{
          icon: isAdding ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />,
          label: "Novo Veículo",
          onClick: async () => {
            setIsAdding(true);
            await handleAddVehicle();
            setIsAdding(false);
          },
          colorClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/40"
        }}
      >
        <Table>
          <TableHeader className="bg-[#FAFAFA]">
            <TableHead 
              sortable 
              sortDirection={sortColumn === 'name' ? sortDirection : null} 
              onClick={() => handleSort('name')}
            >
              Veículo
            </TableHead>
            <TableHead 
              className="w-[180px]"
              sortable 
              sortDirection={sortColumn === 'status' ? sortDirection : null} 
              onClick={() => handleSort('status')}
            >
              Status
            </TableHead>
            <TableHead 
              className="hidden sm:table-cell"
              sortable 
              sortDirection={sortColumn === 'cost' ? sortDirection : null} 
              onClick={() => handleSort('cost')}
            >
              Custo Total
            </TableHead>
            <TableHead
              sortable 
              sortDirection={sortColumn === 'profit' ? sortDirection : null} 
              onClick={() => handleSort('profit')}
            >
              Lucro Líquido
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-stone-400 text-sm">
                  Nenhum veículo movimentado ou em estoque neste mês.
                </TableCell>
              </TableRow>
            )}
              {sortedVehicles
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map(v => {
                const expenses = v.despesas.reduce((acc, e) => acc + e.value, 0);
                const totalCost = v.valorCompra + expenses;
                const profit = v.valorVenda - totalCost;
                
                return (
                  <TableRow 
                    key={v.id}
                    onClick={() => {
                      if (v.status !== 'Vendido') setActiveVehicle(v);
                    }}
                    interactive={v.status !== 'Vendido'}
                    className={v.status === 'Vendido' ? 'bg-stone-100/50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        {(() => {
                          const hasPhoto = Boolean(v.image || (v.galeria && v.galeria.length > 0));
                          return (
                            <div 
                              className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border relative transition-all ${
                                hasPhoto 
                                  ? "bg-stone-100 border-stone-200 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-1" 
                                  : "bg-stone-50 border-stone-200 border-dashed cursor-default"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hasPhoto) {
                                  setFullscreenImage(v.image || v.galeria[0]);
                                }
                              }}
                            >
                              {hasPhoto ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={v.image || v.galeria[0]} alt={v.name} className={`w-full h-full object-cover ${v.status === 'Vendido' ? 'grayscale opacity-70' : ''}`} />
                              ) : (
                                <CarFront size={20} className="text-stone-300" />
                              )}
                              
                              {v.status === 'Vendido' && hasPhoto && (
                                <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center">
                                  <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-sm" />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-stone-800 truncate text-sm">{v.name}</h3>
                            {v.debts && v.debts.length > 0 && (
                              <span title="Possui Débitos"><AlertTriangle size={14} className="text-amber-500" /></span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 truncate max-w-[150px] sm:max-w-[200px]">
                            {v.placa ? `Placa: ${v.placa} - ` : ''} 
                            {v.description || 'Sem descrição'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="relative">
                      <div className="relative inline-block w-max">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (v.status !== 'Vendido') {
                              setOpenDropdownId(openDropdownId === v.id ? null : v.id);
                            }
                          }}
                          className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap w-[140px] ${
                            v.status === 'Vendido' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' 
                              : v.status === 'Manutenção'
                              ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:shadow-sm cursor-pointer'
                              : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:shadow-sm cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                            {v.status === 'Vendido' ? <CheckCircle2 size={12} className="shrink-0" /> : v.status === 'Manutenção' ? <Wrench size={12} className="shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                            <span className="truncate">{v.status}</span>
                          </span>
                          {v.status !== 'Vendido' && <ChevronDown size={12} className="opacity-50 shrink-0" />}
                        </button>

                        {openDropdownId === v.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                            <div className="absolute top-full mt-2 left-6 w-44 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'Em Estoque'); }}
                                className="w-full text-left px-4 py-3 text-xs font-semibold text-stone-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Em Estoque
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'Manutenção'); }}
                                className="w-full text-left px-4 py-3 text-xs font-semibold text-stone-600 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2"
                              >
                                <Wrench size={12} className="text-amber-600" /> Manutenção
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'Vendido'); }}
                                className="w-full text-left px-4 py-3 text-xs font-semibold text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                              >
                                <CheckCircle2 size={12} className="text-emerald-600" /> Vendido
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm text-stone-800">{formatCurrency(totalCost)}</span>
                        {expenses > 0 && (
                          <span className="text-[10px] text-rose-500 font-medium">+{formatCurrency(expenses)} desp.</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {v.status === 'Vendido' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-bold text-sm ${profit > 0 ? 'text-emerald-600' : profit < 0 ? 'text-rose-600' : 'text-stone-600'}`}>
                            {profit > 0 ? '+' : ''}{formatCurrency(profit)}
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">Vendido por {formatCurrency(v.valorVenda)}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-stone-400 italic">Estoque</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            const isConfirmed = await confirm({
                              title: "Excluir Veículo",
                              message: "Tem certeza que deseja excluir este veículo? As despesas associadas a ele também serão excluídas.",
                              confirmText: "Excluir",
                              cancelText: "Cancelar",
                              type: "danger"
                            });
                            if (isConfirmed) {
                              setIsDeletingId(v.id);
                              try {
                                await api.delete(`/vehicles/${v.id}`);
                              } catch(err) {
                                console.error(err);
                              }
                              setVehicles(vehicles.filter(ve => ve.id !== v.id));
                              // Remove fixed expenses linked to this vehicle
                              setFixedExpenses(fixedExpenses.filter(exp => exp.linkedVehicleId !== v.id));
                              setIsDeletingId(null);
                            }
                          }}
                          disabled={isDeletingId === v.id}
                          className="text-stone-300 hover:text-rose-500 disabled:opacity-50 disabled:hover:bg-transparent p-2 rounded-lg hover:bg-rose-50 lg:opacity-0 group-hover:opacity-100 transition-all print:hidden"
                          title="Excluir Veículo"
                        >
                          {isDeletingId === v.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVehicle(v);
                          }}
                          className={`p-2 rounded-lg transition-all print:hidden ${v.status === 'Vendido' ? 'lg:opacity-0 group-hover:opacity-100 text-stone-300 hover:text-blue-500 hover:bg-blue-50' : 'text-stone-300 hover:text-blue-500 hover:bg-blue-50'}`}
                          title="Ver Detalhes"
                        >
                          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </ViewLayout>
      {sellingVehicle && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 border border-stone-200">
            <h3 className="text-lg font-bold text-stone-800 mb-2">Confirmar Venda</h3>
            <p className="text-sm text-stone-600 mb-6">Deseja alterar o veículo <strong>{sellingVehicle.name}</strong> para Vendido e emitir o Recibo de Compra e Venda?</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Comprador</label>
                <input 
                  type="text" 
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">CPF/CNPJ</label>
                <input 
                  type="text" 
                  value={buyerDoc}
                  onChange={e => setBuyerDoc(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end flex-wrap">
              <button 
                onClick={() => setSellingVehicle(null)}
                className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  setIsSelling(true);
                  await confirmSale(false);
                  setIsSelling(false);
                }}
                disabled={isSelling}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer flex-1"
              >
                {isSelling ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Vender
              </button>
              <button 
                onClick={async () => {
                  setIsSelling(true);
                  await confirmSale(true);
                  setIsSelling(false);
                }}
                disabled={isSelling}
                className="px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-900 disabled:opacity-70 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer flex-1"
              >
                {isSelling ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                Vender e Gerar Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
