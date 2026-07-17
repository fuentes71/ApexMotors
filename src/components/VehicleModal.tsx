import { X, Camera, Plus, Trash2, Save, Tag, AlertTriangle, Search, FileWarning, FileText, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useData } from "../context/DataContext";
import { useState, useRef, useEffect } from "react";
import { Vehicle, Expense, Category } from "../types";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { formatCurrency, getCategoryColor, getCategoryIcon } from "../utils";
import { generateContractPDF } from "../utils/pdfExport";

export function VehicleModal() {
  const { 
    activeVehicle, setActiveVehicle, 
    vehicles, setVehicles, 
    fullscreenImage, setFullscreenImage,
    fixedExpenses, setFixedExpenses,
    contractTemplate
  } = useData();

  const { showToast } = useToast();
  const [draftVehicle, setDraftVehicle] = useState<Vehicle | null>(null);
  const [prevActiveVehicle, setPrevActiveVehicle] = useState<Vehicle | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseValue, setNewExpenseValue] = useState("");
  const [newExpenseCat, setNewExpenseCat] = useState<Category>("Mecânica");
  const [newExpenseRecurrence, setNewExpenseRecurrence] = useState<Expense["recurrence"]>("Única");
  const [newExpenseAddToMonthly, setNewExpenseAddToMonthly] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeVehicle !== prevActiveVehicle) {
    setPrevActiveVehicle(activeVehicle);
    if (activeVehicle) {
      setDraftVehicle(JSON.parse(JSON.stringify(activeVehicle)));
    } else {
      setDraftVehicle(null);
      setShowConfirmClose(false);
    }
  }

  const isDirty = JSON.stringify(activeVehicle) !== JSON.stringify(draftVehicle);

  const handleSave = async () => {
    if (!draftVehicle) return;
    setIsSaving(true);
    try {
      const isNew = draftVehicle.id === "new";
      let res: any;
      if (isNew) {
        res = await api.post(`/vehicles`, draftVehicle);
        setVehicles([...vehicles, res.data]);
      } else {
        res = await api.put(`/vehicles/${draftVehicle.id}`, draftVehicle);
        setVehicles(vehicles.map(v => v.id === draftVehicle.id ? res.data : v));
      }
      setActiveVehicle(null);
      showToast(isNew ? "Veículo cadastrado com sucesso!" : "Veículo atualizado com sucesso!", "success");
    } catch (e) {
      console.error(e);
      // Fallback
      if (draftVehicle.id !== "new") {
        setVehicles(vehicles.map(v => v.id === draftVehicle.id ? draftVehicle : v));
      }
      setActiveVehicle(null);
      showToast("Veículo salvo localmente (modo offline)", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  const renderFullscreenGallery = () => {
    if (!fullscreenImage) return null;
    
    let galeria = [fullscreenImage];
    if (draftVehicle) {
      galeria = draftVehicle.galeria;
    } else {
      const vehicle = vehicles.find(v => v.galeria.includes(fullscreenImage));
      if (vehicle) galeria = vehicle.galeria;
    }
    
    const currentIndex = Math.max(0, galeria.indexOf(fullscreenImage));

    return (
      <div className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in" onClick={() => setFullscreenImage(null)}>
        <button 
          onClick={() => setFullscreenImage(null)}
          className="absolute top-6 right-6 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X size={32} />
        </button>

        {galeria.length > 1 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : galeria.length - 1;
                setFullscreenImage(galeria[prevIndex]);
              }}
              className="absolute left-6 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <ChevronLeft size={48} />
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                const nextIndex = currentIndex < galeria.length - 1 ? currentIndex + 1 : 0;
                setFullscreenImage(galeria[nextIndex]);
              }}
              className="absolute right-6 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <ChevronRight size={48} />
            </button>
          </>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fullscreenImage} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg relative z-0" alt="Preview" />
      </div>
    );
  };

  if (!activeVehicle || !draftVehicle) {
    return renderFullscreenGallery();
  }



  const handleUpdate = <K extends keyof Vehicle>(field: K, value: Vehicle[K]) => {
    setDraftVehicle(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleConsultarDebitos = () => {
    if (!draftVehicle?.placa) {
      alert("Preencha a placa primeiro!");
      return;
    }
    setIsConsulting(true);
    setTimeout(() => {
      // Mock API call to public/free API (Simulated)
      const mockDebts = [
        { id: "d1", type: "IPVA", amount: 1540.50, dueDate: "2026-08-15", description: "IPVA 2026 - Cota Única" },
        { id: "d2", type: "Multa", amount: 130.16, dueDate: "2026-07-20", description: "Excesso de Velocidade" }
      ] as Vehicle['debts'];
      setDraftVehicle({ ...draftVehicle, debts: mockDebts });
      setIsConsulting(false);
    }, 1500);
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
      const fixedExp = {
        id: crypto.randomUUID(),
        name: newExp.name,
        value: newExp.value,
        category: "Outros" as const,
        dueDate: new Date().toISOString().split('T')[0],
        isPaid: false,
        linkedVehicleId: draftVehicle.id
      };
      setFixedExpenses([...fixedExpenses, fixedExp]);
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

  const handleCloseAttempt = () => {
    if (isSaving) {
      setActiveVehicle(null);
      return;
    }
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
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Placa</label>
                  <input 
                    type="text" 
                    placeholder="ABC-1234"
                    value={draftVehicle.placa || ""}
                    onChange={(e) => handleUpdate("placa", e.target.value.toUpperCase())}
                    className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Renavam</label>
                  <input 
                    type="text" 
                    value={draftVehicle.renavam || ""}
                    onChange={(e) => handleUpdate("renavam", e.target.value)}
                    className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all"
                  />
                </div>
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
                    disabled={activeVehicle?.status === 'Vendido'}
                    onChange={(e) => {
                      const newStatus = e.target.value as "Em Estoque" | "Manutenção" | "Vendido";
                      if (newStatus === "Vendido") {
                        handleUpdate("status", "Vendido");
                        handleUpdate("dataVenda", new Date().toISOString().split('T')[0]);
                      } else {
                        handleUpdate("status", newStatus);
                        handleUpdate("dataVenda", undefined);
                      }
                    }}
                    className={`w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all ${activeVehicle?.status === 'Vendido' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <option value="Em Estoque">Em Estoque</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
                {draftVehicle.status === "Vendido" && (
                  <div className="md:col-span-2 p-5 bg-emerald-50 rounded-xl border border-emerald-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                        <Check size={16} /> Dados da Venda
                      </h4>
                      <button
                        onClick={() => generateContractPDF(draftVehicle, contractTemplate)}
                        className="flex items-center gap-2 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-all shadow-sm font-medium"
                      >
                        <FileText size={14} />
                        Gerar Recibo PDF
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-2 block">Data de Venda</label>
                        <input 
                          type="date" 
                          value={draftVehicle.dataVenda || ""}
                          onChange={(e) => handleUpdate("dataVenda", e.target.value)}
                          className="w-full font-medium text-stone-700 bg-white outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-2 px-3 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-2 block">Nome do Comprador</label>
                        <input 
                          type="text" 
                          placeholder="Ex: João da Silva"
                          value={draftVehicle.buyerName || ""}
                          onChange={(e) => handleUpdate("buyerName", e.target.value)}
                          className="w-full font-medium text-stone-700 bg-white outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-2 px-3 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-2 block">CPF/CNPJ</label>
                        <input 
                          type="text" 
                          placeholder="000.000.000-00"
                          value={draftVehicle.buyerDoc || ""}
                          onChange={(e) => handleUpdate("buyerDoc", e.target.value)}
                          className="w-full font-medium text-stone-700 bg-white outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-2 px-3 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Debts & IPVA (Integration Placeholder) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                  <FileWarning size={16} className="text-amber-500" />
                  Histórico e Débitos (IPVA/Multas)
                </h3>
                <button 
                  onClick={handleConsultarDebitos}
                  disabled={isConsulting || !draftVehicle.placa}
                  className="flex items-center gap-2 text-sm bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-all"
                >
                  {isConsulting ? (
                    <span className="animate-pulse">Consultando Sinesp/Detran...</span>
                  ) : (
                    <>
                      <Search size={14} />
                      Consultar
                    </>
                  )}
                </button>
              </div>

              {draftVehicle.debts && draftVehicle.debts.length > 0 ? (
                <div className="space-y-3">
                  {draftVehicle.debts.map(debt => (
                    <div key={debt.id} className="flex justify-between items-center bg-amber-50 border border-amber-200/60 p-3 rounded-xl">
                      <div className="flex flex-col">
                        <span className="font-semibold text-amber-900 text-sm">{debt.type} - {debt.description}</span>
                        <span className="text-xs text-amber-700">Vencimento: {debt.dueDate}</span>
                      </div>
                      <span className="font-bold text-amber-700">{formatCurrency(debt.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-stone-100 flex justify-end gap-4 font-semibold text-stone-800">
                    <span>Total em Débitos:</span>
                    <span className="text-rose-600">{formatCurrency(draftVehicle.debts.reduce((a, b) => a + b.amount, 0))}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  <p className="text-sm text-stone-500">
                    {draftVehicle.debts ? "Nenhum débito encontrado." : "Consulte a placa para verificar IPVA, Licenciamento e Multas."}
                  </p>
                </div>
              )}
            </div>

            {/* Gallery */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-800 mb-4 uppercase tracking-wider">Galeria de Imagens</h3>
              <div className="grid grid-cols-4 gap-3">
                {draftVehicle.galeria.map((img, i) => (
                  <div key={i} className="aspect-square bg-stone-100 rounded-lg overflow-hidden group relative shadow-sm border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" alt="Galeria" onClick={() => setFullscreenImage(img)} />
                    <button 
                      onClick={() => {
                        const newGal = draftVehicle.galeria.filter((_, idx) => idx !== i);
                        handleUpdate("galeria", newGal);
                        if (draftVehicle.image === img) {
                          handleUpdate("image", newGal[0] || "");
                        }
                      }}
                      className="absolute top-2 right-2 bg-rose-500/90 text-white lg:opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-600 transition-all shadow-sm backdrop-blur-sm"
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
                      <button onClick={() => handleRemoveExpense(exp.id)} className="text-stone-300 hover:text-rose-500 p-1.5 bg-white border border-stone-200 rounded-md lg:opacity-0 group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm">
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
          
          <div className="p-6 border-t border-stone-200 bg-white mt-auto">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
              {isSaving ? 'Salvando...' : 'Salvar Veículo'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Close Modal */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-stone-800 mb-2">Alterações não salvas</h3>
            <p className="text-stone-600 mb-6">
              Você tem alterações que não foram salvas. O que deseja fazer?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSaving && <Loader2 size={20} className="animate-spin" />}
                Salvar Alterações
              </button>
              <button 
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 rounded-lg font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Continuar Editando
              </button>
              <button 
                onClick={() => setActiveVehicle(null)}
                className="px-4 py-2 rounded-lg font-medium bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image View */}
      {renderFullscreenGallery()}
    </>
  );
}
