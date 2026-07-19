import { X, Save, Loader2, User, Shield } from "lucide-react";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { Employee, Role } from "../types";
import { useToast } from "../context/ToastContext";

export function EmployeeModal() {
  const { activeEmployee, setActiveEmployee, employees, setEmployees } = useData();
  const { showToast } = useToast();
  const [draftEmployee, setDraftEmployee] = useState<Employee | null>(null);
  const [prevActiveEmployee, setPrevActiveEmployee] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (activeEmployee !== prevActiveEmployee) {
    setPrevActiveEmployee(activeEmployee);
    if (activeEmployee) {
      setDraftEmployee(JSON.parse(JSON.stringify(activeEmployee)));
    } else {
      setDraftEmployee(null);
    }
  }

  const isDirty = JSON.stringify(activeEmployee) !== JSON.stringify(draftEmployee);

  const handleCloseAttempt = () => {
    if (isSaving) return;
    if (isDirty) {
      handleSave();
    } else {
      setActiveEmployee(null);
    }
  };

  const handleSave = async () => {
    if (!draftEmployee) return;
    
    // Validations
    if (!draftEmployee.name.trim() || !draftEmployee.email.trim()) {
      showToast("Preencha nome e e-mail", "error");
      return;
    }

    setIsSaving(true);
    try {
      // Mock API call to save employee
      setTimeout(() => {
        const isNew = draftEmployee.id === "new";
        
        if (isNew) {
          const newEmp = { ...draftEmployee, id: Date.now().toString() };
          setEmployees([...employees, newEmp]);
          showToast("Funcionário cadastrado com sucesso!", "success");
        } else {
          setEmployees(employees.map(e => e.id === draftEmployee.id ? draftEmployee : e));
          showToast("Funcionário atualizado com sucesso!", "success");
        }
        
        setActiveEmployee(null);
        setIsSaving(false);
      }, 500);
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar funcionário", "error");
      setIsSaving(false);
    }
  };

  if (!activeEmployee || !draftEmployee) return null;

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
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              {draftEmployee.role === 'Admin' ? <Shield size={20} /> : <User size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                {activeEmployee.id === "new" ? "Novo Funcionário" : "Editar Funcionário"}
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
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nome Completo</label>
              <input 
                type="text" 
                value={draftEmployee.name}
                onChange={e => setDraftEmployee({...draftEmployee, name: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Ex: Roberto Silva"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">E-mail Corporativo</label>
              <input 
                type="email" 
                value={draftEmployee.email}
                onChange={e => setDraftEmployee({...draftEmployee, email: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="email@apexmotors.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nível de Acesso</label>
              <select 
                value={draftEmployee.role}
                onChange={e => setDraftEmployee({...draftEmployee, role: e.target.value as Role})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="Seller">Vendedor (Acesso Limitado)</option>
                <option value="Admin">Admin (Acesso Total)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Data de Cadastro</label>
              <input 
                type="date" 
                value={draftEmployee.createdAt ? new Date(draftEmployee.createdAt).toISOString().split('T')[0] : ''}
                onChange={e => setDraftEmployee({...draftEmployee, createdAt: new Date(e.target.value).toISOString()})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                disabled={activeEmployee.id !== "new"}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-stone-200 bg-white">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
            {isSaving ? 'Salvando...' : 'Salvar Funcionário'}
          </button>
        </div>
      </div>
    </div>
  );
}
