import { X, Save, Loader2, User } from "lucide-react";
import { useData } from "../context/DataContext";
import { useState } from "react";
import { Client } from "../types";
import api from "../services/api";

export function ClientModal() {
  const { activeClient, setActiveClient, clients, setClients } = useData();
  const [draftClient, setDraftClient] = useState<Client | null>(null);
  const [prevActiveClient, setPrevActiveClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (activeClient !== prevActiveClient) {
    setPrevActiveClient(activeClient);
    if (activeClient) {
      setDraftClient(JSON.parse(JSON.stringify(activeClient)));
    } else {
      setDraftClient(null);
    }
  }

  const handleSave = async () => {
    if (!draftClient) return;
    setIsSaving(true);
    try {
      if (clients.find(c => c.id === draftClient.id)) {
        const res = await api.put(`/clients/${draftClient.id}`, draftClient);
        setClients(clients.map(c => c.id === draftClient.id ? res.data : c));
      } else {
        const res = await api.post(`/clients`, draftClient);
        setClients([...clients, res.data]);
      }
      setActiveClient(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeClient || !draftClient) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                {activeClient.id === "new" ? "Novo Cliente" : "Editar Cliente"}
              </h2>
            </div>
          </div>
          <button 
            onClick={() => setActiveClient(null)}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Nome do Cliente</label>
              <input 
                type="text" 
                value={draftClient.name}
                onChange={e => setDraftClient({...draftClient, name: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Ex: Roberto Silva"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Telefone</label>
                <input 
                  type="text" 
                  value={draftClient.phone}
                  onChange={e => setDraftClient({...draftClient, phone: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">E-mail</label>
                <input 
                  type="email" 
                  value={draftClient.email}
                  onChange={e => setDraftClient({...draftClient, email: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Status da Negociação</label>
              <select 
                value={draftClient.status}
                onChange={e => setDraftClient({...draftClient, status: e.target.value as any})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
              >
                <option value="Lead">Lead</option>
                <option value="Negociando">Negociando</option>
                <option value="Cliente">Cliente Fidelizado</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Interesse</label>
              <input 
                type="text" 
                value={draftClient.interest}
                onChange={e => setDraftClient({...draftClient, interest: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Ex: Honda Civic 2020"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Data de Cadastro</label>
              <input 
                type="date" 
                value={draftClient.createdAt}
                onChange={e => setDraftClient({...draftClient, createdAt: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Anotações / Histórico</label>
              <textarea 
                value={draftClient.notes}
                onChange={e => setDraftClient({...draftClient, notes: e.target.value})}
                rows={4}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                placeholder="Detalhes da negociação, histórico de conversas..."
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
            {isSaving ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}
