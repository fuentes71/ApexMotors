import { X, Save, Loader2, Receipt } from "lucide-react";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { Expense } from "../types";
import api from "../services/api";

export function ExpenseModal() {
  const { activeExpense, setActiveExpense, fixedExpenses, setFixedExpenses } = useData();
  const [draftExpense, setDraftExpense] = useState<Expense | null>(null);
  const [prevActiveExpense, setPrevActiveExpense] = useState<Expense | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (activeExpense !== prevActiveExpense) {
    setPrevActiveExpense(activeExpense);
    if (activeExpense) {
      setDraftExpense(JSON.parse(JSON.stringify(activeExpense)));
    } else {
      setDraftExpense(null);
    }
  }

  const handleSave = async () => {
    if (!draftExpense) return;
    setIsSaving(true);
    try {
      if (fixedExpenses.find(e => e.id === draftExpense.id)) {
        const res = await api.put(`/expenses/${draftExpense.id}`, draftExpense);
        setFixedExpenses(fixedExpenses.map(e => e.id === draftExpense.id ? res.data : e));
      } else {
        const res = await api.post(`/expenses`, draftExpense);
        setFixedExpenses([...fixedExpenses, res.data]);
      }
      setActiveExpense(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeExpense || !draftExpense) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                {activeExpense.id === "new" ? "Nova Despesa" : "Editar Despesa"}
              </h2>
            </div>
          </div>
          <button 
            onClick={() => setActiveExpense(null)}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nome da Despesa</label>
              <input 
                type="text" 
                value={draftExpense.name}
                onChange={e => setDraftExpense({...draftExpense, name: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: Aluguel, Água..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Data Início</label>
                <input 
                  type="date" 
                  value={draftExpense.startDate || ''}
                  onChange={e => setDraftExpense({...draftExpense, startDate: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Data Fim (Opcional)</label>
                <input 
                  type="date" 
                  value={draftExpense.endDate || ''}
                  onChange={e => setDraftExpense({...draftExpense, endDate: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Valor</label>
                <input 
                  type="number" 
                  value={draftExpense.value || ''}
                  onChange={e => setDraftExpense({...draftExpense, value: Number(e.target.value)})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Recorrência</label>
                <select 
                  value={draftExpense.recurrence || 'Mensal'}
                  onChange={e => setDraftExpense({...draftExpense, recurrence: e.target.value as RecurrenceType})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
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
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Categoria</label>
              <select 
                value={draftExpense.category}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draftExpense.image} alt="Comprovante" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setDraftExpense({...draftExpense, image: undefined})}
                  className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
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
