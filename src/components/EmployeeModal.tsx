import { X, Save, Loader2, User, Shield } from "lucide-react";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { Employee, Role } from "../types";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { DateInput } from "./DateInput";
import { toISODate, RoleEnum } from "../utils";

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
    if (!draftEmployee.id && (!draftEmployee.password || draftEmployee.password.length < 6)) {
      showError("password", "A senha inicial deve ter no mínimo 6 caracteres.");
      hasError = true;
    }

    if (hasError) return;

    setIsSaving(true);
    try {
      const isNew = !draftEmployee.id;
      let res: any;
      const payload = { ...draftEmployee };
      if (payload.createdAt) payload.createdAt = toISODate(payload.createdAt) || payload.createdAt;

      if (isNew) {
        delete payload.id;
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
      <div 
        className="fixed inset-0 z-50 flex justify-end bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div className="absolute inset-0" onClick={handleCloseAttempt}></div>
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
                className={`w-full bg-stone-50 border ${errors.email ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                placeholder="email@apexmotors.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.email}</p>}
            </div>

            {!activeEmployee.id && (
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Senha Inicial <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  value={draftEmployee.password || ""}
                  onChange={e => setDraftEmployee({...draftEmployee, password: e.target.value})}
                  className={`w-full bg-stone-50 border ${errors.password ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                  placeholder="Mínimo de 6 caracteres"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.password}</p>}
              </div>
            )}

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

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Data de Cadastro</label>
              <DateInput 
                value={draftEmployee.createdAt}
                onChangeDate={val => setDraftEmployee({...draftEmployee, createdAt: val})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                disabled={!!activeEmployee.id}
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
    
    {showConfirmClose && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center animate-in fade-in p-4">
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" onClick={() => setShowConfirmClose(false)}></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-8 max-w-md w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowConfirmClose(false)}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100/80 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5 text-white">
              <span className="text-3xl font-bold">!</span>
            </div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600 mb-3">
              Alterações não salvas
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed px-4">
              Você tem alterações que não foram salvas. Se sair agora, você perderá todo o progresso recente. O que deseja fazer?
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="flex-1 px-4 py-3 rounded-2xl font-semibold text-stone-600 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200/80 backdrop-blur-sm transition-all cursor-pointer"
              >
                Continuar
              </button>
              <button
                onClick={() => setActiveEmployee(null)}
                className="flex-1 px-4 py-3 rounded-2xl font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 transition-all cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
