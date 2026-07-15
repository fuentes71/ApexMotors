import { Wallet, Trash2, Plus, Check, Paperclip, ChevronDown, ImageIcon, FileText, Download, X, ChevronRight, Pencil, AlertTriangle } from "lucide-react";
import { formatCurrency, calculateTotalFixedForPeriod } from "../utils";
import { Expense } from "../types";
import { useState, Fragment } from "react";
import { useData } from "../context/DataContext";

interface FinanceViewProps {
  fixedExpenses: Expense[];
  setFixedExpenses: (e: Expense[]) => void;
  totalFixed: number;
}

export function FinanceView({
  fixedExpenses, setFixedExpenses, totalFixed
}: FinanceViewProps) {
  const { startMonth, endMonth, vehicles } = useData();
  const [expandedFixedId, setExpandedFixedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCloseEdit = (exp: Expense) => {
    if (!exp.name.trim() || exp.value <= 0 || !exp.startDate) {
      alert("A descrição, valor (maior que 0) e data de início são obrigatórios!");
      return;
    }
    setExpandedFixedId(null);
  };

  const handleAddFixedExpense = () => {
    const newId = Date.now().toString();
    const newExpense: Expense = {
      id: newId,
      name: '',
      value: 0,
      recurrence: 'Mensal',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    };
    setFixedExpenses([...fixedExpenses, newExpense]);
    setExpandedFixedId(newId);

    // Auto-focus after render
    setTimeout(() => {
      document.getElementById(`expense-name-${newId}`)?.focus();
    }, 100);
  };

  const handleFixedImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFixedExpenses(fixedExpenses.map(exp => exp.id === id ? {...exp, image: url} : exp));
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
      <div className="w-full max-w-4xl mx-auto bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-[#FDFBF7] flex-wrap gap-4">
          <div className="flex items-center gap-3 text-blue-600">
             <Wallet size={24} />
             <h3 className="font-semibold text-xl text-stone-900">Despesas Mensais</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Total Mensal</p>
              <p className="text-xl font-bold text-rose-600">{formatCurrency(totalFixed)}</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-stone-200 text-xs text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 font-medium">Descrição</th>
                <th className="py-4 px-6 font-medium">Tipo</th>
                <th className="py-4 px-6 font-medium">Valor Base</th>
                <th className="py-4 px-6 font-medium" title="Valor somado dentro do período selecionado no filtro">Total (No Período)</th>
                <th className="py-4 px-6 font-medium text-center">Comprovante</th>
                <th className="py-4 px-6 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(() => {
                const visibleExpenses = fixedExpenses.filter(exp => 
                  calculateTotalFixedForPeriod([exp], startMonth, endMonth) > 0 || expandedFixedId === exp.id
                );
                
                if (visibleExpenses.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400 text-sm">
                        Nenhuma despesa ativa neste período.
                      </td>
                    </tr>
                  );
                }

                return visibleExpenses.map(exp => {
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
                  {/* MODO VISUALIZAÇÃO */}
                  <tr 
                    className={`hover:bg-stone-50 transition-colors group ${expandedFixedId === exp.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="py-4 px-6">
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
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${recurrenceColor}`}>
                        {exp.recurrence || 'Mensal'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-sm text-stone-900">{formatCurrency(exp.value)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-sm text-stone-600">
                        {formatCurrency(calculateTotalFixedForPeriod([exp], startMonth, endMonth))}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
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
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => expandedFixedId === exp.id ? handleCloseEdit(exp) : setExpandedFixedId(exp.id)}
                          className={`p-1.5 rounded-lg transition-all ${expandedFixedId === exp.id ? 'bg-blue-100 text-blue-600' : 'text-stone-400 hover:text-blue-600 hover:bg-stone-100'}`}
                          title={expandedFixedId === exp.id ? "Recolher" : "Editar"}
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
                              setFixedExpenses(fixedExpenses.filter(e => e.id !== exp.id));
                            }
                          }}
                          className="p-1.5 rounded-lg transition-all text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* MODO EDIÇÃO (EXPANDIDO) */}
                  {expandedFixedId === exp.id && (
                    <tr className="bg-stone-50/50 border-b-2 border-stone-200">
                      <td colSpan={6} className="p-6 pt-2">
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Detalhes da Despesa</span>
                            <button onClick={() => setFixedExpenses(fixedExpenses.filter(e => e.id !== exp.id))} className="text-stone-400 hover:text-rose-500 p-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" title="Excluir">
                              <Trash2 size={14} /> Excluir
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div>
                                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nome da Despesa</label>
                                <input 
                                  id={`expense-name-${exp.id}`}
                                  value={exp.name} 
                                  onChange={e => setFixedExpenses(fixedExpenses.map(ex => ex.id === exp.id ? {...ex, name: e.target.value} : ex))}
                                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                  placeholder="Ex: Aluguel, Água..."
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Início</label>
                                  <input 
                                    type="date"
                                    value={exp.startDate || ''} 
                                    onChange={e => setFixedExpenses(fixedExpenses.map(ex => ex.id === exp.id ? {...ex, startDate: e.target.value} : ex))}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Fim (Opcional)</label>
                                  <input 
                                    type="date"
                                    value={exp.endDate || ''} 
                                    onChange={e => setFixedExpenses(fixedExpenses.map(ex => ex.id === exp.id ? {...ex, endDate: e.target.value} : ex))}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Valor Bruto</label>
                                  <input 
                                    type="number" 
                                    value={exp.value || ''} 
                                    onChange={e => setFixedExpenses(fixedExpenses.map(ex => ex.id === exp.id ? {...ex, value: Number(e.target.value)} : ex))}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                    placeholder="R$ 0,00"
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Recorrência</label>
                                  <select 
                                    value={exp.recurrence || 'Mensal'} 
                                    onChange={e => setFixedExpenses(fixedExpenses.map(ex => ex.id === exp.id ? {...ex, recurrence: e.target.value as any} : ex))}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer"
                                  >
                                    <option value="Única">Única</option>
                                    <option value="Diária">Diária</option>
                                    <option value="Semanal">Semanal</option>
                                    <option value="Quinzenal">Quinzenal</option>
                                    <option value="Mensal">Mensal</option>
                                    <option value="Anual">Anual</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Comprovante</label>
                                <div className="relative overflow-hidden h-[38px]">
                                  <button className="w-full h-full px-4 flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-colors text-sm font-medium shadow-sm">
                                    <Paperclip size={14} /> {exp.image ? 'Trocar Comprovante' : 'Anexar Comprovante'}
                                  </button>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFixedImageUpload(exp.id, e)} 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {exp.image && (
                            <div className="relative w-48 h-32 bg-stone-100 rounded-xl overflow-hidden mt-1 group border border-stone-200 shadow-sm">
                              <img src={exp.image} alt="Comprovante" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setFixedExpenses(fixedExpenses.map(ex => ex.id === exp.id ? {...ex, image: undefined} : ex))}
                                className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}

                          <div className="mt-2 flex justify-end">
                            <button 
                              onClick={() => handleCloseEdit(exp)}
                              className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
                            >
                              <Check size={16} /> Concluir Edição
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
                );
              })})()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-4 fade-in print:hidden">
        <div className="relative group">
          <button 
            onClick={handleAddFixedExpense}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/40 transition-all hover:scale-110 active:scale-95"
          >
            <Plus size={24} />
          </button>
          <div className="absolute bottom-full mb-3 right-0 bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Nova Despesa
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-stone-900"></div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none">
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
