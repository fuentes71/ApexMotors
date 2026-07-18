"use client";

import { useState } from "react";
import { useData } from "../context/DataContext";
import { Plus, Trash2, Shield, User } from "lucide-react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "./ui/Table";
import { ViewLayout } from "./ui/ViewLayout";
import { Employee, Role } from "../types";

export function EmployeesView() {
  const { employees, setEmployees, currentUser } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState<{name: string, email: string, role: Role}>({ name: "", email: "", role: "Vendedor" });

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = () => {
    if (!newEmp.name || !newEmp.email) return;
    const emp: Employee = {
      id: Date.now().toString(),
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      createdAt: new Date().toISOString()
    };
    setEmployees(prev => [...prev, emp]);
    setShowAddModal(false);
    setNewEmp({ name: "", email: "", role: "Vendedor" });
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  return (
    <>
      <ViewLayout
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome ou e-mail..."
        showViewToggle={true}
        floatingAction={{
          icon: <Plus size={24} />,
          label: "Novo Funcionário",
          onClick: () => setShowAddModal(true),
          colorClass: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/40"
        }}
      >
        {(viewMode) => (
          viewMode === 'table' ? (
            <Table>
              <TableHeader className="bg-[#FAFAFA]">
                <TableHead>Funcionário</TableHead>
                <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(emp => (
                  <TableRow key={emp.id} className="group cursor-default hover:bg-stone-50/50">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">{emp.name}</span>
                          <span className="text-xs text-stone-500 sm:hidden">{emp.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-stone-600 font-medium">
                      {emp.email}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        emp.role === 'Admin' 
                          ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {emp.role === 'Admin' ? <Shield size={12} /> : <User size={12} />}
                        {emp.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeEmployee(emp.id); }}
                          className="text-stone-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-stone-500">
                        <User size={32} className="text-stone-300 mb-3" />
                        <p className="font-semibold text-stone-600">Nenhum funcionário encontrado</p>
                        <p className="text-sm">Tente ajustar os termos de busca</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
              {filteredEmployees.map(emp => (
                <div 
                  key={emp.id}
                  className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group flex flex-col h-full relative"
                >
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeEmployee(emp.id); }}
                      className="text-stone-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shadow-sm">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 group-hover:text-indigo-600 transition-colors truncate">{emp.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 ${
                        emp.role === 'Admin' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {emp.role === 'Admin' ? <Shield size={10} /> : <User size={10} />}
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                      <div className="w-6 h-6 rounded-md bg-stone-50 flex items-center justify-center">
                        <User size={14} className="text-stone-400" />
                      </div>
                      <span className="truncate">{emp.email}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredEmployees.length === 0 && (
                <div className="col-span-full h-48 flex flex-col items-center justify-center text-stone-500 bg-white/50 rounded-2xl border border-dashed border-stone-300">
                  <User size={32} className="text-stone-300 mb-3" />
                  <p className="font-semibold text-stone-600">Nenhum funcionário encontrado</p>
                </div>
              )}
            </div>
          )
        )}
      </ViewLayout>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold text-stone-900 mb-6 tracking-tight">Novo Funcionário</h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2 block ml-1">Nome completo</label>
                <input 
                  type="text" 
                  value={newEmp.name}
                  onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3.5 outline-none transition-all font-medium shadow-sm"
                  placeholder="Nome do colaborador"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2 block ml-1">E-mail corporativo</label>
                <input 
                  type="email" 
                  value={newEmp.email}
                  onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3.5 outline-none transition-all font-medium shadow-sm"
                  placeholder="email@apexmotors.com"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2 block ml-1">Nível de Acesso</label>
                <select 
                  value={newEmp.role}
                  onChange={e => setNewEmp({...newEmp, role: e.target.value as Role})}
                  className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3.5 outline-none transition-all font-medium cursor-pointer shadow-sm appearance-none"
                >
                  <option value="Vendedor">Vendedor (Acesso Limitado)</option>
                  <option value="Admin">Admin (Acesso Total)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-10">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3.5 text-stone-600 font-bold hover:bg-stone-100 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddEmployee}
                disabled={!newEmp.name || !newEmp.email}
                className="flex-1 px-4 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
