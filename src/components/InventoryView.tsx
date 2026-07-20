import { CarFront, CheckCircle2, Trash2, ChevronRight, Plus, AlertTriangle, ChevronDown, Edit2, Wrench, Loader2, FileText, Search, Download, Calendar, Tag, X, AlertCircle } from "lucide-react";
import { formatCurrency, DEFAULT_CAR_IMAGE, VehicleStatusEnum } from "../utils";
import Image from "next/image";
import { Vehicle } from "../types";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { useSort } from "../hooks/useSort";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { generateContractPDF } from "../utils/pdfExport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import { ViewLayout } from "./ui/ViewLayout";
import { Tooltip } from "./ui/Tooltip";
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
  const { fixedExpenses, setFixedExpenses, contractTemplate, setFullscreenImage, currentUser } = useData();
  const isVendedor = currentUser?.role === 'Seller';
  const { showToast } = useToast();
  const { confirm: confirmAction } = useConfirm();

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
    (v.licensePlate && v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const { sortColumn, sortDirection, handleSort, sortedData: sortedVehicles } = useSort(displayVehicles, {
    cost: (a, b) => {
      const costA = (a.purchaseValue || 0) + a.expenses.reduce((acc, e) => acc + e.value, 0);
      const costB = (b.purchaseValue || 0) + b.expenses.reduce((acc, e) => acc + e.value, 0);
      return costA - costB;
    },
    profit: (a, b) => {
      const costA = (a.purchaseValue || 0) + a.expenses.reduce((acc, e) => acc + e.value, 0);
      const profitA = (a.saleValue || 0) - costA;
      
      const costB = (b.purchaseValue || 0) + b.expenses.reduce((acc, e) => acc + e.value, 0);
      const profitB = (b.saleValue || 0) - costB;
      
      return profitA - profitB;
    }
  });

  const handleStatusChange = async (v: Vehicle, newStatus: string) => {
    if (newStatus === 'Sold') {
      setSellingVehicle(v);
      setBuyerName(v.buyerName || "");
      setBuyerDoc(v.buyerDoc || "");
    } else {
      const updatedV = { ...v, status: newStatus as Vehicle['status'], saleDate: undefined, buyerName: undefined, buyerDoc: undefined };
      try {
        const res = await api.patch(`/vehicles/${v.id}`, updatedV);
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
      status: 'Sold' as const, 
      saleDate: new Date().toISOString().split('T')[0],
      buyerName,
      buyerDoc
    };
    
    try {
      const res = await api.patch(`/vehicles/${sellingVehicle.id}`, updatedV);
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
        showViewToggle={true}
        pagination={{
          currentPage,
          totalPages: Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE),
          onPageChange: setCurrentPage
        }}
        floatingAction={isVendedor ? undefined : {
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
        {(viewMode) => (
          viewMode === 'table' ? (
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
                {isVendedor ? (
                  <>
                    <TableHead>Placa</TableHead>
                    <TableHead>Valor Venda</TableHead>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                    const expenses = v.expenses.reduce((acc, e) => acc + e.value, 0);
                    const totalCost = (v.purchaseValue || 0) + expenses;
                    const profit = (v.saleValue || 0) - totalCost;
                    
                    return (
                      <TableRow 
                        key={v.id}
                        onClick={() => {
                          setActiveVehicle(v);
                        }}
                        interactive={true}
                        className={v.status === 'Sold' ? 'bg-stone-100/50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-4">
                            {(() => {
                              const hasPhoto = Boolean(v.image || (v.gallery && v.gallery.length > 0));
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
                                      setFullscreenImage(v.image || v.gallery[0]);
                                    }
                                  }}
                                >
                                  {hasPhoto ? (
                                    <Image src={v.image || v.gallery[0]} alt={v.name} fill className={`object-cover ${v.status === 'Sold' ? 'grayscale opacity-60' : ''}`} unoptimized />
                                  ) : (
                                    <CarFront size={20} className="text-stone-300" />
                                  )}
                                  {v.status === 'Sold' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/30">
                                      <CheckCircle2 size={12} className="text-emerald-300 drop-shadow" />
                                      <span className="text-[7px] font-bold text-white uppercase tracking-wide drop-shadow leading-tight">Vendido</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Tooltip content={v.name} position="top">
                                  <h3 className="font-semibold text-stone-800 truncate text-sm">{v.name}</h3>
                                </Tooltip>
                                {v.debts && v.debts.length > 0 && (
                                  <span title="Possui Débitos"><AlertTriangle size={14} className="text-amber-500" /></span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 truncate max-w-[150px] sm:max-w-[200px]">
                                {v.licensePlate ? `Placa: ${v.licensePlate} - ` : ''} 
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
                                if (v.status !== 'Sold') {
                                  setOpenDropdownId(openDropdownId === v.id ? null : (v.id || null));
                                }
                              }}
                              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap w-[140px] ${
                                v.status === 'Sold' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' 
                                  : v.status === 'Maintenance'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:shadow-sm cursor-pointer'
                                  : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:shadow-sm cursor-pointer'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                                {v.status === 'Sold' ? <CheckCircle2 size={12} className="shrink-0" /> : v.status === 'Maintenance' ? <Wrench size={12} className="shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                                <span className="truncate">{VehicleStatusEnum[v.status] || v.status}</span>
                              </span>
                              {v.status !== 'Sold' && <ChevronDown size={12} className="opacity-50 shrink-0" />}
                            </button>
    
                            {openDropdownId === v.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                                <div className="absolute top-full mt-2 left-6 w-44 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'In Stock'); }}
                                    className="w-full text-left px-4 py-3 text-xs font-semibold text-stone-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Em Estoque
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'Maintenance'); }}
                                    className="w-full text-left px-4 py-3 text-xs font-semibold text-stone-600 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2"
                                  >
                                    <Wrench size={12} className="text-amber-600" /> Manutenção
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'Sold'); }}
                                    className="w-full text-left px-4 py-3 text-xs font-semibold text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                                  >
                                    <CheckCircle2 size={12} className="text-emerald-600" /> Vendido
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        {isVendedor ? (
                          <>
                            <TableCell>{v.licensePlate || 'N/A'}</TableCell>
                            <TableCell className="font-semibold text-stone-900">{formatCurrency(v.saleValue || 0)}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-sm text-stone-800">{formatCurrency(totalCost)}</span>
                                {expenses > 0 && (
                                  <span className="text-[10px] text-rose-500 font-medium">+{formatCurrency(expenses)} desp.</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {v.status === 'Sold' ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className={`font-bold text-sm ${profit > 0 ? 'text-emerald-600' : profit < 0 ? 'text-rose-600' : 'text-stone-600'}`}>
                                    {profit > 0 ? '+' : ''}{formatCurrency(profit)}
                                  </span>
                                  <span className="text-[10px] text-stone-500 font-medium">Vendido por {formatCurrency(v.saleValue || 0)}</span>
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-stone-400 italic">Estoque</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {v.status === 'Sold' && (v.buyerName || v.buyerDoc) && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateContractPDF(v, contractTemplate);
                                    }}
                                    className="text-stone-300 hover:text-emerald-500 p-2 rounded-lg hover:bg-emerald-50 lg:opacity-0 group-hover:opacity-100 transition-all print:hidden"
                                    title="Gerar Recibo de Venda"
                                  >
                                    <FileText size={16} />
                                  </button>
                                )}
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const isConfirmed = await confirmAction({
                                      title: "Excluir Veículo",
                                      message: "Tem certeza que deseja excluir este veículo? As despesas associadas a ele também serão excluídas.",
                                      confirmText: "Excluir",
                                      cancelText: "Cancelar",
                                      type: "danger"
                                    });
                                    if (isConfirmed) {
                                      setIsDeletingId(v.id || null);
                                      try {
                                        await api.delete(`/vehicles/${v.id}`);
                                        setVehicles(vehicles.filter(ve => ve.id !== v.id));
                                        setFixedExpenses(fixedExpenses.filter(exp => exp.linkedVehicleId !== v.id));
                                        showToast("Veículo excluído com sucesso!", "success");
                                      } catch(err: any) {
                                        console.error(err);
                                        showToast(err.response?.data?.message || "Erro ao excluir veículo", "error");
                                      } finally {
                                        setIsDeletingId(null);
                                      }
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
                                  className={`p-2 rounded-lg transition-all print:hidden ${v.status === 'Sold' ? 'lg:opacity-0 group-hover:opacity-100 text-stone-300 hover:text-blue-500 hover:bg-blue-50' : 'text-stone-300 hover:text-blue-500 hover:bg-blue-50'}`}
                                  title="Ver Detalhes"
                                >
                                  <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
              {filteredVehicles.length === 0 && (
                <div className="col-span-full py-12 text-center text-stone-400 text-sm bg-white rounded-2xl border border-stone-200 border-dashed">
                  Nenhum veículo movimentado ou em estoque neste mês.
                </div>
              )}
              {sortedVehicles
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map(v => {
                  const expenses = v.expenses.reduce((acc, e) => acc + e.value, 0);
                  const totalCost = (v.purchaseValue || 0) + expenses;
                  const profit = (v.saleValue || 0) - totalCost;
                  const hasPhoto = Boolean(v.image || (v.gallery && v.gallery.length > 0));

                  return (
                    <div 
                      key={v.id}
                      onClick={() => {
                        setActiveVehicle(v);
                      }}
                      className={`bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4 relative cursor-pointer`}
                    >

                      <div className="absolute top-4 right-4 flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {v.status === 'Sold' && (v.buyerName || v.buyerDoc) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              generateContractPDF(v, contractTemplate);
                            }}
                            className="text-stone-400 hover:text-emerald-500 bg-white shadow-sm border border-stone-100 p-2 rounded-full hover:bg-emerald-50 print:hidden"
                            title="Gerar Recibo de Venda"
                          >
                            <FileText size={14} />
                          </button>
                        )}
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            const isConfirmed = await confirmAction({
                              title: "Excluir Veículo",
                              message: "Tem certeza que deseja excluir este veículo?",
                              confirmText: "Excluir",
                              cancelText: "Cancelar",
                              type: "danger"
                            });
                            if (isConfirmed) {
                              setIsDeletingId(v.id || null);
                              try {
                                await api.delete(`/vehicles/${v.id}`);
                              } catch(err) {
                                console.error(err);
                              }
                              setVehicles(vehicles.filter(ve => ve.id !== v.id));
                              setFixedExpenses(fixedExpenses.filter(exp => exp.linkedVehicleId !== v.id));
                              setIsDeletingId(null);
                            }
                          }}
                          disabled={isDeletingId === v.id}
                          className="text-stone-400 hover:text-rose-500 bg-white shadow-sm border border-stone-100 p-2 rounded-full hover:bg-rose-50 print:hidden"
                          title="Excluir Veículo"
                        >
                          {isDeletingId === v.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVehicle(v);
                          }}
                          className="text-stone-500 hover:text-blue-600 bg-white shadow-sm border border-stone-100 p-2 rounded-full hover:bg-blue-50"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>

                      <div className="flex gap-4">
                        <div 
                          className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border relative transition-all ${
                            hasPhoto 
                              ? "bg-stone-100 border-stone-200 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-1" 
                              : "bg-stone-50 border-stone-200 border-dashed cursor-default"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasPhoto) {
                              setFullscreenImage(v.image || v.gallery[0]);
                            }
                          }}
                        >
                          {hasPhoto ? (
                            <Image src={v.image || v.gallery[0]} alt={v.name} fill className={`object-cover ${v.status === 'Sold' ? 'grayscale opacity-60' : ''}`} unoptimized />
                          ) : (
                            <CarFront size={24} className="text-stone-300" />
                          )}
                          {v.status === 'Sold' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/30 cursor-pointer" onClick={(e) => { e.stopPropagation(); if (hasPhoto) setFullscreenImage(v.image || v.gallery[0]); }}>
                              <CheckCircle2 size={18} className="text-emerald-300 drop-shadow" />
                              <span className="text-[9px] font-bold text-white uppercase tracking-wide mt-0.5 drop-shadow">Vendido</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col justify-center min-w-0 pr-16">
                          <div className="flex items-center gap-2">
                            <Tooltip content={v.name} position="top">
                              <h3 className="font-bold text-stone-900 text-lg truncate">{v.name}</h3>
                            </Tooltip>
                            {v.debts && v.debts.length > 0 && (
                              <span title="Possui Débitos"><AlertTriangle size={14} className="text-amber-500" /></span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 truncate">{v.licensePlate ? `Placa: ${v.licensePlate}` : 'Sem placa'}</p>
                          <p className="text-xs text-stone-400 mt-1 truncate">{v.description || 'Sem descrição'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                        <div>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Custo Total</p>
                          <p className="text-sm font-semibold text-stone-800">{formatCurrency(totalCost)}</p>
                          {expenses > 0 && <p className="text-[10px] text-rose-500 font-medium">+{formatCurrency(expenses)} desp.</p>}
                        </div>
                        
                        <div>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Lucro / Status</p>
                          {v.status === 'Sold' ? (
                            <>
                              <p className={`text-sm font-bold ${profit > 0 ? 'text-emerald-600' : profit < 0 ? 'text-rose-600' : 'text-stone-600'}`}>
                                {profit > 0 ? '+' : ''}{formatCurrency(profit)}
                              </p>
                              <p className="text-[10px] text-stone-500">Venda: {formatCurrency(v.saleValue || 0)}</p>
                            </>
                          ) : (
                            <div className="relative inline-block w-full mt-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === v.id ? null : (v.id || null));
                                }}
                                className={`flex items-center justify-between gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all w-full ${
                                  v.status === 'Maintenance'
                                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                    : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  {v.status === 'Maintenance' ? <Wrench size={10} className="shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                                  <span className="truncate">{VehicleStatusEnum[v.status] || v.status}</span>
                                </span>
                                <ChevronDown size={12} className="opacity-50 shrink-0" />
                              </button>
      
                              {openDropdownId === v.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                                  <div className="absolute top-full mt-1 right-0 w-36 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'In Stock'); }}
                                      className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase text-stone-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Em Estoque
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'Maintenance'); }}
                                      className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase text-stone-600 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2"
                                    >
                                      <Wrench size={10} className="text-amber-600" /> Manutenção
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStatusChange(v, 'Sold'); }}
                                      className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                                    >
                                      <CheckCircle2 size={10} className="text-emerald-600" /> Vendido
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        )}
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
