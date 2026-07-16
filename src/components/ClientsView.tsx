"use client";

import { useState } from "react";
import { useData } from "../context/DataContext";
import { Plus, Search, Edit2, Trash2, Mail, Phone, Calendar, Loader2, Users } from "lucide-react";
import { Client } from "../types";
import { format } from "date-fns";
import api from "../services/api";

export function ClientsView() {
  const { clients, setClients } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  const [draftClient, setDraftClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddClient = async () => {
    setIsAdding(true);
    try {
      const newClient = {
        name: "Novo Cliente",
        phone: "",
        email: "",
        status: "Lead",
        interest: "",
        notes: "",
        createdAt: new Date().toISOString().substring(0, 10)
      };
      
      const response = await api.post('/clients', newClient);
      const created = response.data;
      
      setClients(prev => [...prev, created]);
      setEditingId(created.id);
      setDraftClient(created);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (client: Client) => {
    setEditingId(client.id);
    setDraftClient({ ...client });
  };

  const saveClient = async () => {
    if (!draftClient) return;
    setIsSavingId(draftClient.id);
    try {
      const response = await api.put(`/clients/${draftClient.id}`, draftClient);
      setClients(prev => prev.map(c => c.id === draftClient.id ? response.data : c));
      setEditingId(null);
      setDraftClient(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingId(null);
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    setIsDeletingId(id);
    try {
      await api.delete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead': return 'bg-amber-100 text-amber-800';
      case 'Negociando': return 'bg-blue-100 text-blue-800';
      case 'Cliente': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Users size={24} className="text-indigo-600" />
            Gestão de Clientes e Leads
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Acompanhe interessados, negociações em andamento e clientes fidelizados.
          </p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, e-mail ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold whitespace-nowrap">Cliente</th>
                <th className="p-4 font-semibold whitespace-nowrap hidden sm:table-cell">Contato</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold whitespace-nowrap hidden md:table-cell">Interesse</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredClients.map((client) => {
                const isEditing = editingId === client.id;
                const activeData = isEditing && draftClient ? draftClient : client;

                return (
                  <tr key={client.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="p-4">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <input 
                            type="text" 
                            value={activeData.name}
                            onChange={e => setDraftClient({...activeData, name: e.target.value})}
                            className="px-2 py-1 border border-stone-300 rounded text-sm w-full font-medium"
                          />
                          <input 
                            type="date" 
                            value={activeData.createdAt}
                            onChange={e => setDraftClient({...activeData, createdAt: e.target.value})}
                            className="px-2 py-1 border border-stone-300 rounded text-xs w-full text-stone-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-stone-900">{client.name}</div>
                          <div className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                            <Calendar size={12} /> {format(new Date(client.createdAt), 'dd/MM/yyyy')}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <input 
                            type="text" 
                            value={activeData.phone}
                            placeholder="Telefone"
                            onChange={e => setDraftClient({...activeData, phone: e.target.value})}
                            className="px-2 py-1 border border-stone-300 rounded text-sm w-full"
                          />
                          <input 
                            type="email" 
                            value={activeData.email}
                            placeholder="E-mail"
                            onChange={e => setDraftClient({...activeData, email: e.target.value})}
                            className="px-2 py-1 border border-stone-300 rounded text-sm w-full"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-stone-600">
                            <Phone size={14} className="text-stone-400" />
                            {client.phone || <span className="text-stone-300 italic">Não informado</span>}
                          </div>
                          <div className="flex items-center gap-2 text-stone-600">
                            <Mail size={14} className="text-stone-400" />
                            {client.email || <span className="text-stone-300 italic">Não informado</span>}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <select 
                          value={activeData.status}
                          onChange={e => setDraftClient({...activeData, status: e.target.value as any})}
                          className="px-2 py-1 border border-stone-300 rounded text-sm w-full"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Negociando">Negociando</option>
                          <option value="Cliente">Cliente</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <input 
                            type="text" 
                            value={activeData.interest}
                            placeholder="Veículo de interesse"
                            onChange={e => setDraftClient({...activeData, interest: e.target.value})}
                            className="px-2 py-1 border border-stone-300 rounded text-sm w-full"
                          />
                          <textarea 
                            value={activeData.notes}
                            placeholder="Observações..."
                            onChange={e => setDraftClient({...activeData, notes: e.target.value})}
                            className="px-2 py-1 border border-stone-300 rounded text-sm w-full min-h-[60px]"
                          />
                        </div>
                      ) : (
                        <div className="max-w-[200px]">
                          <div className="font-medium text-stone-800 line-clamp-1">{client.interest || "-"}</div>
                          <div className="text-xs text-stone-500 line-clamp-2 mt-1" title={client.notes}>{client.notes}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-md transition-colors text-xs font-medium"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={saveClient}
                            disabled={isSavingId === client.id}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-xs font-medium flex items-center justify-center min-w-[70px] disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isSavingId === client.id ? <Loader2 size={14} className="animate-spin" /> : "Salvar"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEditing(client)}
                            className="p-1.5 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Editar cliente"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteClient(client.id)}
                            disabled={isDeletingId === client.id}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                            title="Excluir cliente"
                          >
                            {isDeletingId === client.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-4 fade-in print:hidden">
        <div className="relative group">
          <button 
            onClick={handleAddClient}
            disabled={isAdding}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-600/40 transition-all hover:scale-110 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isAdding ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
          </button>
          <div className="absolute bottom-full mb-3 right-0 bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Novo Cliente
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-stone-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
