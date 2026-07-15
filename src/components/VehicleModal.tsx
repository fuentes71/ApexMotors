import { X, Camera, Plus, Trash2, Save, Tag, AlertTriangle, Check } from "lucide-react";
import { useData } from "../context/DataContext";
import { useState, useRef, useEffect } from "react";
import { Expense, Category, Vehicle } from "../types";
import { formatCurrency, getCategoryColor, getCategoryIcon } from "../utils";

export function VehicleModal() {
  const { 
    activeVehicle, setActiveVehicle, 
    vehicles, setVehicles, 
    fullscreenImage, setFullscreenImage,
    fixedExpenses, setFixedExpenses
  } = useData();

  const [draftVehicle, setDraftVehicle] = useState<Vehicle | null>(null);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseValue, setNewExpenseValue] = useState("");
  const [newExpenseCat, setNewExpenseCat] = useState<Category>("Mecânica");
  const [newExpenseRecurrence, setNewExpenseRecurrence] = useState<Expense["recurrence"]>("Única");
  const [newExpenseAddToMonthly, setNewExpenseAddToMonthly] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeVehicle) {
      // Deep copy to avoid mutating the original until saved
      setDraftVehicle(JSON.parse(JSON.stringify(activeVehicle)));
    } else {
      setDraftVehicle(null);
      setShowConfirmClose(false);
    }
  }, [activeVehicle]);

  if (!activeVehicle || !draftVehicle) return null;

  const isDirty = JSON.stringify(activeVehicle) !== JSON.stringify(draftVehicle);

  const handleUpdate = (field: keyof Vehicle, value: any) => {
    setDraftVehicle({ ...draftVehicle, [field]: value });
  };

  const handleAddExpense = () => {
    if (!newExpenseName || !newExpenseValue) return;
    const newId = Date.now().toString();
    const newExp: Expense = {
      id: newId,
      name: `${draftVehicle.name} - ${newExpenseName}`,
      value: Number(newExpenseValue),
      category: newExpenseCat,
      recurrence: newExpenseRecurrence,
      linkedVehicleId: draftVehicle.id,
      addToMonthly: newExpenseAddToMonthly,
      startDate: new Date().toISOString().split('T')[0]
    };

    setDraftVehicle({
      ...draftVehicle,
      despesas: [...draftVehicle.despesas, newExp]
    });

    if (newExpenseAddToMonthly) {
      setFixedExpenses([...fixedExpenses, newExp]);
    }

    setNewExpenseName("");
    setNewExpenseValue("");
    setNewExpenseRecurrence("Única");
    setNewExpenseAddToMonthly(false);
  };

  const handleRemoveExpense = (id: string) => {
    setDraftVehicle({
      ...draftVehicle,
      despesas: draftVehicle.despesas.filter(e => e.id !== id)
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const url = URL.createObjectURL(e.target.files[0]);
    setDraftVehicle({
      ...draftVehicle,
      image: draftVehicle.image || url,
      galeria: [...draftVehicle.galeria, url]
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    setVehicles(vehicles.map(v => v.id === draftVehicle.id ? draftVehicle : v));
    setActiveVehicle(null);
  };

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      setActiveVehicle(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex justify-end animate-in fade-in">
        {/* Backdrop clickable area */}
        <div className="absolute inset-0" onClick={handleCloseAttempt}></div>

        <div className="relative w-full max-w-2xl bg-[#FDFBF7] h-full shadow-2xl animate-in slide-in-from-right flex flex-col z-10">
          <div className="flex justify-between items-center p-6 border-b border-stone-200/60 bg-white">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              {draftVehicle.name === "Novo Veículo" && draftVehicle.valorCompra === 0 ? "Adicionar Veículo" : "Editar Veículo"}
            </h2>
            <button onClick={handleCloseAttempt} className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
            {/* Header / Info */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Nome do Veículo</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="text" 
                    value={draftVehicle.name}
                    onChange={(e) => handleUpdate("name", e.target.value)}
                    className="w-full text-lg font-bold text-stone-900 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-3 pl-11 pr-4 transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Valor de Compra (R$)</label>
                  <input 
                    type="number" 
                    value={draftVehicle.valorCompra || ""}
                    onChange={(e) => handleUpdate("valorCompra", Number(e.target.value))}
                    className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Valor de Venda (R$)</label>
                  <input 
                    type="number" 
                    value={draftVehicle.valorVenda || ""}
                    onChange={(e) => handleUpdate("valorVenda", Number(e.target.value))}
                    className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Data de Entrada</label>
                  <input 
                    type="date" 
                    value={draftVehicle.dataEntrada}
                    onChange={(e) => handleUpdate("dataEntrada", e.target.value)}
                    className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Status</label>
                  <select 
                    value={draftVehicle.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus === "Vendido") {
                        handleUpdate("status", "Vendido");
                        handleUpdate("dataVenda", new Date().toISOString().split('T')[0]);
                      } else {
                        handleUpdate("status", "Em Estoque");
                        handleUpdate("dataVenda", undefined);
                      }
                    }}
                    className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all cursor-pointer"
                  >
                    <option value="Em Estoque">Em Estoque</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
                {draftVehicle.status === "Vendido" && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Data de Venda</label>
                    <input 
                      type="date" 
                      value={draftVehicle.dataVenda || ""}
                      onChange={(e) => handleUpdate("dataVenda", e.target.value)}
                      className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-800 mb-4 uppercase tracking-wider">Galeria de Imagens</h3>
              <div className="grid grid-cols-4 gap-3">
                {draftVehicle.galeria.map((img, i) => (
                  <div key={i} className="aspect-square bg-stone-100 rounded-lg overflow-hidden group relative shadow-sm border border-stone-200">
                    <img src={img} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" alt="Galeria" onClick={() => setFullscreenImage(img)} />
                    <button 
                      onClick={() => {
                        const newGal = draftVehicle.galeria.filter((_, idx) => idx !== i);
                        handleUpdate("galeria", newGal);
                        if (draftVehicle.image === img) {
                          handleUpdate("image", newGal[0] || "");
                        }
                      }}
                      className="absolute top-2 right-2 bg-rose-500/90 text-white opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-600 transition-all shadow-sm backdrop-blur-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-stone-50 border-2 border-dashed border-stone-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:text-blue-500 transition-all cursor-pointer"
                >
                  <Camera size={24} className="mb-2" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Adicionar</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-800 mb-4 uppercase tracking-wider">Despesas do Veículo</h3>
              
              <div className="space-y-3 mb-6">
                {draftVehicle.despesas.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center p-3.5 bg-stone-50 hover:bg-[#FDFBF7] border border-stone-200 hover:border-stone-300 rounded-xl group transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getCategoryColor(exp.category || "Outros")} bg-white shadow-sm border border-stone-100`}>
                        {getCategoryIcon(exp.category || "Outros")}
                      </div>
                      <span className="font-semibold text-stone-800 text-sm">{exp.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-stone-900">{formatCurrency(exp.value)}</span>
                      <button onClick={() => handleRemoveExpense(exp.id)} className="text-stone-300 hover:text-rose-500 p-1.5 bg-white border border-stone-200 rounded-md opacity-0 group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {draftVehicle.despesas.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                    <p className="text-sm font-medium text-stone-500">Nenhuma despesa registrada para este veículo.</p>
                  </div>
                )}
              </div>
              {/* Nova Despesa Form */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-sm mt-4">
                <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Plus size={14} /> Registrar Nova Despesa
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-5">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase mb-1.5 block">Descrição</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Anúncio Facebook..." 
                      value={newExpenseName}
                      onChange={e => setNewExpenseName(e.target.value)}
                      className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3.5 py-2 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-shadow shadow-sm"
                    />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase mb-1.5 block">Valor (R$)</label>
                    <input 
                      type="number" 
                      placeholder="0,00" 
                      value={newExpenseValue}
                      onChange={e => setNewExpenseValue(e.target.value)}
                      className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3.5 py-2 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-shadow shadow-sm"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase mb-1.5 block">Categoria</label>
                    <select 
                      value={newExpenseCat}
                      onChange={e => setNewExpenseCat(e.target.value as Category)}
                      className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3.5 py-2 text-sm font-medium text-stone-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-shadow shadow-sm"
                    >
                      <option value="Mecânica">Mecânica</option>
                      <option value="Funilaria">Funilaria</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Documentação">Documentação</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-stone-200 gap-4">
                  <div className="flex items-center gap-4 flex-wrap h-[32px]">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative inline-flex items-center h-5 rounded-full w-9">
                        <input 
                          type="checkbox" 
                          checked={newExpenseAddToMonthly}
                          onChange={e => {
                            setNewExpenseAddToMonthly(e.target.checked);
                            if (!e.target.checked) setNewExpenseRecurrence('Única');
                          }}
                          className="peer sr-only"
                        />
                        <div className="w-9 h-5 bg-stone-200 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 peer-checked:bg-blue-600 transition-colors"></div>
                        <div className="absolute left-[2px] top-[2px] bg-white border border-stone-300 rounded-full h-4 w-4 transition-transform peer-checked:translate-x-[16px] peer-checked:border-white shadow-sm"></div>
                      </div>
                      <span className="text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors">
                        Lançar no Financeiro
                      </span>
                    </label>

                    {newExpenseAddToMonthly && (
                      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="w-px h-4 bg-stone-300 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Recorrência:</span>
                          <select 
                            value={newExpenseRecurrence}
                            onChange={e => setNewExpenseRecurrence(e.target.value as Expense['recurrence'])}
                            className="bg-transparent outline-none text-sm font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
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
                    )}
                  </div>

                  <button 
                    onClick={handleAddExpense}
                    disabled={!newExpenseName || !newExpenseValue}
                    className="w-full sm:w-auto bg-stone-900 disabled:bg-stone-200 disabled:text-stone-400 text-white px-5 py-2 rounded-lg hover:bg-stone-800 hover:-translate-y-[1px] active:translate-y-0 transition-all font-semibold flex items-center justify-center gap-2 shadow-sm disabled:shadow-none"
                  >
                    <Plus size={16} /> <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Save Button */}
          {isDirty && (
            <div className="absolute bottom-8 right-8 animate-in slide-in-from-bottom-4 fade-in z-50">
              <div className="relative group">
                <button 
                  onClick={handleSave}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/40 transition-all hover:scale-110 active:scale-95"
                >
                  <Save size={24} />
                </button>
                <div className="absolute bottom-full mb-3 right-0 bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                  Salvar alterações
                  <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-stone-900"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-in zoom-in-95">
            <div className="flex items-center gap-4 text-amber-500 mb-4">
              <div className="p-3 bg-amber-50 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Sair sem salvar?</h3>
            </div>
            <p className="text-stone-500 text-sm mb-6">
              Você fez alterações neste veículo. Tem certeza que deseja sair? Todas as edições não salvas serão perdidas.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 rounded-lg font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Continuar Editando
              </button>
              <button 
                onClick={() => setActiveVehicle(null)}
                className="px-4 py-2 rounded-lg font-medium bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image View */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in" onClick={() => setFullscreenImage(null)}>
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={32} />
          </button>
          <img src={fullscreenImage} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" alt="Preview" />
        </div>
      )}
    </>
  );
}
