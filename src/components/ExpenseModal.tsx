import { X, Save, Loader2, Receipt, Upload, Calendar } from "lucide-react";
import { NumericFormat } from "react-number-format";
import Image from "next/image";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { Expense, RecurrenceType, Category } from "../types";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { DateInput } from "./DateInput";
import { toISODate } from "../utils";

export function ExpenseModal() {
  const { activeExpense, setActiveExpense, fixedExpenses, setFixedExpenses } = useData();
  const { showToast } = useToast();
  const { confirm: confirmAction } = useConfirm();
  const [draftExpense, setDraftExpense] = useState<Expense | null>(null);
  const [prevActiveExpense, setPrevActiveExpense] = useState<Expense | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (activeExpense !== prevActiveExpense) {
    setPrevActiveExpense(activeExpense);
    if (activeExpense) {
      setDraftExpense(JSON.parse(JSON.stringify(activeExpense)));
    } else {
      setDraftExpense(null);
    }
  }

  const isDirty = JSON.stringify(activeExpense) !== JSON.stringify(draftExpense);

  const handleCloseAttempt = async () => {
    if (isSaving) return;
    if (isDirty) {
      const isConfirmed = await confirmAction({
        title: "Descartar alterações?",
        message: "Você tem alterações não salvas. Tem certeza que deseja fechar sem salvar?",
        confirmText: "Sim, descartar",
        cancelText: "Continuar editando"
      });
      if (isConfirmed) {
        setActiveExpense(null);
      }
    } else {
      setActiveExpense(null);
    }
  };

  const showError = (field: string, msg: string) => {
    setErrors(prev => ({ ...prev, [field]: msg }));
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }, 4000);
  };

  const handleSave = async () => {
    if (!draftExpense) return;
    
    // Validations (BAS-24)
    let hasError = false;
    if (!draftExpense.name?.trim()) {
      showError("name", "O nome da despesa é obrigatório.");
      hasError = true;
    }
    if (!draftExpense.value || draftExpense.value <= 0) {
      showError("value", "O valor da despesa é obrigatório.");
      hasError = true;
    }
    if (!draftExpense.startDate) {
      showError("startDate", "A data de início é obrigatória.");
      hasError = true;
    }

    if (hasError) return;

    setIsSaving(true);
    try {
      const isNew = !draftExpense.id;
      
      const payload: any = { ...draftExpense };
      payload.recurrence = payload.recurrence || 'Mensal';
      payload.value = Number(payload.value) || 0;
      payload.startDate = toISODate(payload.startDate);
      payload.endDate = toISODate(payload.endDate) || null;
      if (payload.dueDate) payload.dueDate = toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), Number(payload.dueDate)).toISOString().split('T')[0]);

      if (isNew) {
        delete payload.id;
        const res = await api.post('/expenses', payload);
        setFixedExpenses([...fixedExpenses, res.data]);
      } else {
        const res = await api.patch(`/expenses/${payload.id}`, payload);
        setFixedExpenses(fixedExpenses.map(e => e.id === payload.id ? res.data : e));
      }
      setActiveExpense(null);
      showToast(isNew ? "Despesa adicionada com sucesso!" : "Despesa atualizada com sucesso!", "success");
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar despesa", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeExpense || !draftExpense) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleCloseAttempt}
    >
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                {!activeExpense.id ? "Nova Despesa" : "Editar Despesa"}
              </h2>
            </div>
          </div>
          <button 
            onClick={handleCloseAttempt}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nome da Despesa <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={draftExpense.name}
                onChange={e => setDraftExpense({...draftExpense, name: e.target.value})}
                className={`w-full bg-stone-50 border ${errors.name ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                placeholder="Ex: Aluguel, Água..."
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Data Início <span className="text-red-500">*</span></label>
                <DateInput 
                  value={draftExpense.startDate || ''}
                  onChangeDate={val => setDraftExpense({...draftExpense, startDate: val})}
                  className={`w-full bg-stone-50 border ${errors.startDate ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.startDate}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Data Fim (Opcional)</label>
                <DateInput 
                  value={draftExpense.endDate || ''}
                  onChangeDate={val => setDraftExpense({...draftExpense, endDate: val})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Valor <span className="text-red-500">*</span></label>
                <NumericFormat 
                  value={draftExpense.value}
                  onFocus={(e) => e.target.select()}
                  onValueChange={(values) => {
                    if (values.floatValue === undefined) {
                      setDraftExpense({...draftExpense, value: undefined as any});
                      setTimeout(() => setDraftExpense(prev => ({...prev, value: 0})), 0);
                    } else {
                      setDraftExpense({...draftExpense, value: values.floatValue});
                    }
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  className={`w-full bg-stone-50 border ${errors.value ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  placeholder="R$ 0,00"
                />
                {errors.value && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.value}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Recorrência</label>
                <select 
                  value={draftExpense.recurrence || 'Mensal'}
                  onChange={e => setDraftExpense({...draftExpense, recurrence: e.target.value as RecurrenceType})}
                  className={`w-full bg-stone-50 border ${errors.recurrence ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none`}
                >
                  <option value="Única">Única</option>
                  <option value="Diária">Diária</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Anual">Anual</option>
                </select>
                {errors.recurrence && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.recurrence}</p>}
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Categoria</label>
              <select 
                value={draftExpense.category || ""}
                onChange={e => setDraftExpense({...draftExpense, category: e.target.value as Category})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
              >
                <option value="Administrativo">Administrativo</option>
                <option value="Marketing">Marketing</option>
                <option value="Mecânica">Mecânica</option>
                <option value="Funilaria">Funilaria</option>
                <option value="Documentação">Documentação</option>
                <option value="Estética">Estética</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Dia de Vencimento</label>
                <input 
                  type="number"
                  min="1" max="31"
                  value={draftExpense.dueDate || ''}
                  onChange={e => setDraftExpense({...draftExpense, dueDate: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Ex: 5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Comprovante</label>
                <div className="relative overflow-hidden h-[46px]">
                  <button className="w-full h-full px-4 flex items-center justify-center gap-2 bg-stone-50 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-100 hover:border-stone-300 transition-colors text-sm font-medium shadow-sm">
                    {draftExpense.image ? 'Trocar Comprovante' : 'Anexar Comprovante'}
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setDraftExpense({...draftExpense, image: url});
                      }
                    }} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            {draftExpense.image && (
              <div className="relative w-full h-32 bg-stone-100 rounded-xl overflow-hidden mt-1 group border border-stone-200 shadow-sm">
                <Image src={draftExpense.image} alt="Comprovante" fill className="object-cover" unoptimized />
                <button 
                  onClick={() => setDraftExpense({...draftExpense, image: undefined})}
                  className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                  title="Remover comprovante"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={draftExpense.isPaid || false}
                  onChange={e => setDraftExpense({...draftExpense, isPaid: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-stone-700">Despesa já está paga</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-stone-200 bg-white">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
            {isSaving ? 'Salvando...' : 'Salvar Despesa'}
          </button>
        </div>
      </div>
    </div>
  );
}
