import { X, Save, Loader2, User, Shield } from "lucide-react";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { Employee, Role } from "../types";
import { useToast } from "../context/ToastContext";
import type { AxiosResponse } from "axios";
import api from "../services/api";
import { RoleEnum } from "../utils";
import { SidePanelModal } from "./ui/SidePanelModal";
import { ConfirmCloseModal } from "./ui/ConfirmCloseModal";

export function EmployeeModal() {
  const { activeEmployee, setActiveEmployee, employees, setEmployees } = useData();
  const { showToast } = useToast();
  const [draftEmployee, setDraftEmployee] = useState<Employee | null>(null);
  const [prevActiveEmployee, setPrevActiveEmployee] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (activeEmployee !== prevActiveEmployee) {
    setPrevActiveEmployee(activeEmployee);
    if (activeEmployee) {
      setDraftEmployee(JSON.parse(JSON.stringify(activeEmployee)));
    } else {
      setDraftEmployee(null);
      setShowConfirmClose(false);
    }
  }

  const isDirty = JSON.stringify(activeEmployee) !== JSON.stringify(draftEmployee);

  const handleCloseAttempt = () => {
    if (isSaving) {
      setActiveEmployee(null);
      return;
    }
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      setActiveEmployee(null);
    }
  };

  const showError = (field: string, msg: string) => {
    setErrors(prev => ({ ...prev, [field]: msg }));
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }, 4000);
  };

  const handleSave = async () => {
    if (!draftEmployee) return;
    
    // Validations
    let hasError = false;
    if (!draftEmployee.name.trim()) {
      showError("name", "O nome é obrigatório.");
      hasError = true;
    }
    if (!draftEmployee.email.trim()) {
      showError("email", "O e-mail é obrigatório.");
      hasError = true;
    }
    if (hasError) return;

    setIsSaving(true);
    try {
      const isNew = !draftEmployee.id;
      let res: AxiosResponse<Employee>;
      // Only these three are sent. The user sets their own password through
      // the first-access email, and the backend stamps createdAt.
      const payload = {
        name: draftEmployee.name,
        email: draftEmployee.email,
        role: draftEmployee.role,
      };

      if (isNew) {
        res = await api.post(`/users`, payload);
        setEmployees([...employees, res.data]);
        showToast("Funcionário cadastrado com sucesso!", "success");
      } else {
        res = await api.patch(`/users/${draftEmployee.id}`, payload);
        setEmployees(employees.map(e => e.id === draftEmployee.id ? res.data : e));
        showToast("Funcionário atualizado com sucesso!", "success");
      }
      
      setActiveEmployee(null);
    } catch (e) {
      console.error(e);
      // Fallback local caso dê erro (opcional, mantendo comportamento parecido com os outros módulos)
      if (draftEmployee.id !== "new") {
        setEmployees(employees.map(e => e.id === draftEmployee.id ? draftEmployee : e));
      }
      setActiveEmployee(null);
      showToast("Erro na API: Funcionário salvo localmente", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeEmployee || !draftEmployee) return null;

  return (
    <>
      <SidePanelModal onCloseAttempt={handleCloseAttempt}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              {draftEmployee.role === 'Admin' ? <Shield size={20} /> : <User size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                {!activeEmployee.id ? "Novo Funcionário" : "Editar Funcionário"}
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
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nome Completo <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={draftEmployee.name}
                onChange={e => setDraftEmployee({...draftEmployee, name: e.target.value})}
                className={`w-full bg-stone-50 border ${errors.name ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                placeholder="Ex: Roberto Silva"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">E-mail Corporativo <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                value={draftEmployee.email}
                onChange={e => setDraftEmployee({...draftEmployee, email: e.target.value})}
                className={`w-full bg-stone-50 border ${errors.email ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="email@apexmotors.com"
                disabled={!!activeEmployee.id}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nível de Acesso</label>
              <select 
                value={draftEmployee.role}
                onChange={e => setDraftEmployee({...draftEmployee, role: e.target.value as Role})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                {Object.entries(RoleEnum).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
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
      </SidePanelModal>
    
    <ConfirmCloseModal 
      isOpen={showConfirmClose} 
      onClose={() => setShowConfirmClose(false)} 
      onConfirm={() => setActiveEmployee(null)} 
    />
    </>
  );
}
