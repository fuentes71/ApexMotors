import { Wallet, Trash2, Plus, Check, Paperclip, ChevronDown, ImageIcon, FileText, Download, X, ChevronRight, Pencil, AlertTriangle, Loader2, TrendingDown, Search } from "lucide-react";
import { formatCurrency, calculateTotalFixedForPeriod } from "../utils";
import { Expense } from "../types";
import { useState, Fragment } from "react";
import { useSort } from "../hooks/useSort";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import { ViewLayout } from "./ui/ViewLayout";
import api from "../services/api";

const ITEMS_PER_PAGE = 10;

interface FinanceViewProps {
  fixedExpenses: Expense[];
  setFixedExpenses: (e: Expense[]) => void;
  totalFixed: number;
}

export function FinanceView({
  fixedExpenses, setFixedExpenses, totalFixed
}: FinanceViewProps) {
  const { startMonth, endMonth, vehicles, setActiveExpense } = useData();
  const { showToast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const visibleExpenses = fixedExpenses.filter(exp => 
    calculateTotalFixedForPeriod([exp], startMonth, endMonth) > 0 &&
    exp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { sortColumn, sortDirection, handleSort, sortedData: sortedExpenses } = useSort(visibleExpenses, {
    total: (a, b) => {
      const totalA = calculateTotalFixedForPeriod([a], startMonth, endMonth);
      const totalB = calculateTotalFixedForPeriod([b], startMonth, endMonth);
      return totalA - totalB;
    }
  });

  const { confirm } = useConfirm();

  const handleAddFixedExpense = () => {
    setActiveExpense({
      id: "new",
      name: '',
      value: 0,
      recurrence: 'Mensal',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Excluir Despesa",
      message: "Tem certeza que deseja excluir esta despesa? Ela não aparecerá mais nos relatórios.",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      type: "danger"
    });
    if (!isConfirmed) return;

    setIsDeletingId(id);
    try {
      await api.delete(`/expenses/${id}`);
      setFixedExpenses(fixedExpenses.filter(e => e.id !== id));
      showToast("Despesa excluída", "success");
    } catch (e) {
      console.error(e);
      showToast("Erro ao excluir", "error");
    } finally {
      setIsDeletingId(null);
    }
  };



  const downloadImage = (imageUrl: string, expenseName: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `Comprovante_${expenseName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <ViewLayout
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por descrição..."
        pagination={{
          currentPage,
          totalPages: Math.ceil(visibleExpenses.length / ITEMS_PER_PAGE),
          onPageChange: setCurrentPage
        }}
        floatingAction={{
          icon: <Plus size={24} />,
          label: "Nova Despesa",
          onClick: handleAddFixedExpense,
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
              Descrição
            </TableHead>
            <TableHead 
              sortable 
              sortDirection={sortColumn === 'recurrence' ? sortDirection : null} 
              onClick={() => handleSort('recurrence')}
            >
              Tipo
            </TableHead>
            <TableHead 
              sortable 
              sortDirection={sortColumn === 'value' ? sortDirection : null} 
              onClick={() => handleSort('value')}
            >
              Valor Base
            </TableHead>
            <TableHead 
              title="Valor somado dentro do período selecionado no filtro"
              sortable 
              sortDirection={sortColumn === 'total' ? sortDirection : null} 
              onClick={() => handleSort('total')}
            >
              Total (No Período)
            </TableHead>
            <TableHead className="text-center print:hidden">Comprovante</TableHead>
            <TableHead className="text-right print:hidden">Ações</TableHead>
          </TableHeader>
          <TableBody>
            {visibleExpenses.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-stone-400" colSpan={6}>
                  Nenhuma despesa ativa neste período.
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map(exp => {
                const recurrenceColor = {
                  'Única': 'bg-stone-100 text-stone-600',
                  'Diária': 'bg-orange-50 text-orange-600',
                  'Semanal': 'bg-amber-50 text-amber-600',
                  'Quinzenal': 'bg-purple-50 text-purple-600',
                  'Mensal': 'bg-blue-50 text-blue-600',
                  'Anual': 'bg-emerald-50 text-emerald-600'
                }[exp.recurrence || 'Mensal'] || 'bg-blue-50 text-blue-600';

                let isWarning = false;
                if (exp.linkedVehicleId && exp.recurrence && exp.recurrence !== 'Única') {
                  const linkedVehicle = vehicles.find(v => v.id === exp.linkedVehicleId);
                  if (linkedVehicle && linkedVehicle.status === 'Vendido') {
                    isWarning = true;
                  }
                }

                return (
                <Fragment key={exp.id}>
                  <TableRow interactive onClick={() => setActiveExpense(exp)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-stone-800">
                          {exp.name}
                        </span>
                        {isWarning && (
                          <div className="text-rose-500 bg-rose-50 p-1 rounded-full animate-pulse" title="Veículo vendido! Considere encerrar ou remover esta despesa recorrente.">
                            <AlertTriangle size={14} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${recurrenceColor}`}>
                        {exp.recurrence || 'Mensal'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-sm text-stone-900">{formatCurrency(exp.value)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm text-stone-600">
                        {formatCurrency(calculateTotalFixedForPeriod([exp], startMonth, endMonth))}
                      </span>
                    </TableCell>
                    <TableCell className="text-center print:hidden">
                      {exp.image ? (
                        <button 
                          onClick={() => setPreviewImage(exp.image!)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors shadow-sm"
                          title="Abrir Comprovante"
                        >
                          <ImageIcon size={16} />
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center p-2 rounded-lg bg-stone-50 text-stone-300 border border-stone-100" title="Sem comprovante">
                          <FileText size={16} />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                          disabled={isDeletingId === exp.id}
                          className="p-1.5 rounded-lg transition-all text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:hover:bg-transparent"
                          title="Excluir"
                        >
                          {isDeletingId === exp.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                        <button 
                          className="p-1.5 rounded-lg transition-all print:hidden text-stone-300 hover:text-blue-500 hover:bg-blue-50"
                          title="Ver Detalhes"
                        >
                          <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </ViewLayout>

      {/* PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Comprovante Fullscreen" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-auto" />
            <div className="mt-6 flex gap-4 pointer-events-auto">
              <button 
                onClick={() => downloadImage(previewImage, "Despesa_Fixa")}
                className="flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-stone-100 transition-all hover:scale-105 active:scale-95"
              >
                <Download size={20} /> Baixar Comprovante
              </button>
              <button 
                onClick={() => setPreviewImage(null)}
                className="flex items-center justify-center bg-stone-800 text-white w-12 h-12 rounded-full font-bold shadow-lg hover:bg-stone-700 transition-all hover:scale-105 active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
