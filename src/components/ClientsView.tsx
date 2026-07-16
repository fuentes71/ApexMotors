"use client";

import { useState } from "react";
import { useData } from "../context/DataContext";
import { Plus, Search, Trash2, Mail, Phone, Calendar, Loader2, Users, ChevronRight } from "lucide-react";
import { Client } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import { format } from "date-fns";
import api from "../services/api";

export function ClientsView() {
  const { clients, setClients, setActiveClient } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  const [draftClient, setDraftClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddClient = () => {
    setActiveClient({
      id: "new",
      name: "",
      phone: "",
      email: "",
      status: "Lead",
      interest: "",
      notes: "",
      createdAt: new Date().toISOString().substring(0, 10)
    });
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

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-visible">
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

        <Table>
          <TableHeader>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden sm:table-cell">Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Interesse</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => {
              return (
                <TableRow key={client.id} interactive onClick={() => setActiveClient(client)}>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-stone-900">{client.name || "-"}</div>
                      <div className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {format(new Date(client.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
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
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-[200px]">
                      <div className="font-medium text-stone-800 line-clamp-1">{client.interest || "-"}</div>
                      <div className="text-xs text-stone-500 line-clamp-2 mt-1" title={client.notes}>{client.notes}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}
                            disabled={isDeletingId === client.id}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                            title="Excluir cliente"
                          >
                            {isDeletingId === client.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                          <button 
                            className="p-1.5 text-stone-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                            title="Ver detalhes"
                          >
                            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-stone-500" colSpan={5}>
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-4 fade-in print:hidden">
        <div className="relative group">
          <button 
            onClick={handleAddClient}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-600/40 transition-all hover:scale-110 active:scale-95"
          >
            <Plus size={24} />
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
