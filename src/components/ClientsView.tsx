"use client";

import { useState } from "react";
import { useData } from "../context/DataContext";
import { useSort } from "../hooks/useSort";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { generateWhatsAppLink } from "../utils";
import { Search, ChevronRight, Phone, Mail, Calendar, CarFront, Edit2, Trash2, Plus, Loader2, ChevronDown, Check, MessageCircle, Users } from "lucide-react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "./ui/Table";
import { ViewLayout } from "./ui/ViewLayout";
import { Tooltip } from "./ui/Tooltip";
import { Client } from "../types";
import api from "../services/api";
import { format } from "date-fns";

export function ClientsView() {
  const { clients, setClients, setActiveClient, whatsappTemplates } = useData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [whatsappDropdownId, setWhatsappDropdownId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;
  
  const [draftClient, setDraftClient] = useState<Client | null>(null);
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleWhatsApp = (client: Client, withMessage: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = generateWhatsAppLink(client, withMessage, whatsappTemplates);
    if (link) window.open(link, '_blank');
    setWhatsappDropdownId(null);
  };

  const { sortColumn, sortDirection, handleSort, sortedData: sortedClients } = useSort(filteredClients);

  const { confirm: confirmAction } = useConfirm();

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
    const isConfirmed = await confirmAction({
      title: "Excluir Cliente",
      message: "Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      type: "danger"
    });
    if (!isConfirmed) return;
    
    setIsDeletingId(id);
    try {
      await api.delete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
      showToast("Cliente excluído!", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao excluir", "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleStatusChange = async (client: Client, newStatus: Client['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.put(`/clients/${client.id}`, { ...client, status: newStatus });
      setClients(prev => prev.map(c => c.id === client.id ? response.data : c));
      showToast("Status alterado!", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao alterar status", "error");
    } finally {
      setOpenDropdownId(null);
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
    <ViewLayout
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nome, e-mail ou telefone..."
      showViewToggle={true}
      pagination={{
        currentPage,
        totalPages: Math.ceil(filteredClients.length / ITEMS_PER_PAGE),
        onPageChange: setCurrentPage
      }}
      floatingAction={{
        icon: <Plus size={24} />,
        label: "Novo Cliente",
        onClick: handleAddClient,
        colorClass: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/40"
      }}
    >
      {(viewMode) => (
        viewMode === 'table' ? (
          <Table>
            <TableHeader className="bg-[#FAFAFA]">
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'name' ? sortDirection : null} 
                onClick={() => handleSort('name')}
              >
                Cliente
              </TableHead>
              <TableHead className="hidden sm:table-cell">Contato</TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'status' ? sortDirection : null} 
                onClick={() => handleSort('status')}
              >
                Status
              </TableHead>
              <TableHead className="hidden md:table-cell">Interesse</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableHeader>
            <TableBody>
              {sortedClients
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map(client => {
                return (
                  <TableRow key={client.id} interactive onClick={() => setActiveClient(client)}>
                    <TableCell>
                      <div>
                        <Tooltip content={client.name || "-"} position="top">
                          <div className="font-semibold text-stone-900">{client.name || "-"}</div>
                        </Tooltip>
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
                    <TableCell className="relative">
                      <div className="relative inline-block w-[110px]">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === client.id ? null : client.id);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer hover:shadow-sm ${
                            client.status === 'Lead' || client.status === 'Frio' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' :
                            client.status === 'Negociando' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' :
                            client.status === 'Cliente' || client.status === 'Fechado' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' :
                            'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          <span>{client.status}</span>
                          <ChevronDown size={12} className="opacity-50 shrink-0" />
                        </button>
  
                        {openDropdownId === client.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                            <div className="absolute top-full mt-2 left-0 w-36 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                              {['Lead', 'Frio', 'Negociando', 'Cliente', 'Fechado'].map((statusOption) => (
                                <button 
                                  key={statusOption}
                                  onClick={(e) => handleStatusChange(client, statusOption as Client['status'], e)}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 flex items-center justify-between group transition-colors"
                                >
                                  <span className={`font-medium ${client.status === statusOption ? 'text-indigo-600' : 'text-stone-700'}`}>
                                    {statusOption}
                                  </span>
                                  {client.status === statusOption && <Check size={14} className="text-indigo-600" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-[200px]">
                        <div className="font-medium text-stone-800 line-clamp-1">{client.interest || "-"}</div>
                        <div className="text-xs text-stone-500 line-clamp-2 mt-1" title={client.notes}>{client.notes}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}
                              disabled={isDeletingId === client.id}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                              title="Excluir cliente"
                            >
                              {isDeletingId === client.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                            {client.phone && (
                              <div className="relative inline-block">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setWhatsappDropdownId(whatsappDropdownId === client.id ? null : client.id);
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle size={16} />
                                </button>
                                
                                {whatsappDropdownId === client.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setWhatsappDropdownId(null); }} />
                                    <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                      <button 
                                        onClick={(e) => handleWhatsApp(client, true, e)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 flex items-center gap-2 transition-colors text-stone-700"
                                      >
                                        <MessageCircle size={14} className="text-green-600" />
                                        <span className="font-medium">Mensagem automática</span>
                                      </button>
                                      <button 
                                        onClick={(e) => handleWhatsApp(client, false, e)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 flex items-center gap-2 transition-colors text-stone-700 border-t border-stone-100"
                                      >
                                        <Phone size={14} className="text-stone-400" />
                                        <span className="font-medium">Apenas contato</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveClient(client); }}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
            {filteredClients.length === 0 && (
              <div className="col-span-full py-12 text-center text-stone-400 text-sm bg-white rounded-2xl border border-stone-200 border-dashed">
                Nenhum cliente encontrado.
              </div>
            )}
            {sortedClients
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map(client => (
                <div 
                  key={client.id}
                  onClick={() => setActiveClient(client)}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-4 relative"
                >
                  <div className="absolute top-4 right-4 flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {client.phone && (
                      <div className="relative inline-block">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setWhatsappDropdownId(whatsappDropdownId === client.id ? null : client.id);
                          }}
                          className="text-stone-400 hover:text-green-600 bg-white shadow-sm border border-stone-100 p-2 rounded-full hover:bg-green-50"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </button>
                        
                        {whatsappDropdownId === client.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setWhatsappDropdownId(null); }} />
                            <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                              <button 
                                onClick={(e) => handleWhatsApp(client, true, e)}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 flex items-center gap-2 transition-colors text-stone-700"
                              >
                                <MessageCircle size={14} className="text-green-600" />
                                <span className="font-medium">Mensagem automática</span>
                              </button>
                              <button 
                                onClick={(e) => handleWhatsApp(client, false, e)}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 flex items-center gap-2 transition-colors text-stone-700 border-t border-stone-100"
                              >
                                <Phone size={14} className="text-stone-400" />
                                <span className="font-medium">Apenas contato</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}
                      disabled={isDeletingId === client.id}
                      className="text-stone-400 hover:text-rose-500 bg-white shadow-sm border border-stone-100 p-2 rounded-full hover:bg-rose-50 disabled:opacity-50"
                      title="Excluir cliente"
                    >
                      {isDeletingId === client.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveClient(client); }}
                      className="text-stone-500 hover:text-indigo-600 bg-white shadow-sm border border-stone-100 p-2 rounded-full hover:bg-indigo-50"
                      title="Ver detalhes"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border relative transition-all ${
                        client.status === 'Cliente' || client.status === 'Fechado' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                        'bg-stone-50 border-stone-200 text-stone-400'
                      }`}
                    >
                      <Users size={24} />
                    </div>
                    
                    <div className="flex flex-col justify-center min-w-0 pr-28">
                      <div className="flex items-center gap-2">
                        <Tooltip content={client.name || "-"} position="top">
                          <h3 className="font-bold text-stone-900 text-lg truncate">{client.name || "-"}</h3>
                        </Tooltip>
                      </div>
                      <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} /> {format(new Date(client.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                    <div className="col-span-full flex flex-col gap-1.5">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-stone-600 text-xs">
                          <Phone size={12} className="text-stone-400" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-stone-600 text-xs">
                          <Mail size={12} className="text-stone-400" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.interest && (
                        <div className="flex items-center gap-2 text-stone-600 text-xs mt-1">
                          <CarFront size={12} className="text-stone-400 shrink-0" />
                          <span className="truncate">{client.interest}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="relative inline-block w-full">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === client.id ? null : client.id);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide border transition-all ${
                          client.status === 'Lead' || client.status === 'Frio' ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' :
                          client.status === 'Negociando' ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' :
                          client.status === 'Cliente' || client.status === 'Fechado' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' :
                          'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <span>{client.status}</span>
                        <ChevronDown size={12} className="opacity-50 shrink-0" />
                      </button>

                      {openDropdownId === client.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                          <div className="absolute top-full mt-1 left-0 w-full bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                            {['Lead', 'Frio', 'Negociando', 'Cliente', 'Fechado'].map((statusOption) => (
                              <button 
                                key={statusOption}
                                onClick={(e) => handleStatusChange(client, statusOption as Client['status'], e)}
                                className="w-full text-left px-3 py-2.5 text-[11px] font-bold uppercase hover:bg-stone-50 flex items-center justify-between group transition-colors"
                              >
                                <span className={`${client.status === statusOption ? 'text-indigo-600' : 'text-stone-600'}`}>
                                  {statusOption}
                                </span>
                                {client.status === statusOption && <Check size={12} className="text-indigo-600" />}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )
      )}
    </ViewLayout>
  );
}
