import { X, Camera, Plus, Trash2, Save, Tag, AlertTriangle, FileText, Check, ChevronLeft, ChevronRight, Loader2, Pencil } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { IMaskInput } from "react-imask";
import Image from "next/image";
import { useData } from "../context/DataContext";
import { useState, useRef } from "react";
import { Vehicle, Expense, Category, RecurrenceType } from "../types";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { DateInput } from "./DateInput";
import { formatCurrency, getCategoryColor, getCategoryIcon, toISODate, VehicleStatusEnum, CategoryEnum, RecurrenceEnum } from "../utils";
import { generateContractPDF } from "../utils/pdfExport";
import { ImageUploader } from "./ImageUploader";

export function VehicleModal() {
  const {
    activeVehicle, setActiveVehicle,
    vehicles, setVehicles,
    fullscreenImage, setFullscreenImage,
    fixedExpenses, setFixedExpenses,
    contractTemplate, currentUser
  } = useData();
  const isVendedor = currentUser?.role === 'Seller';

  const { showToast } = useToast();
  const [draftVehicle, setDraftVehicle] = useState<Vehicle | null>(null);
  const [prevActiveVehicle, setPrevActiveVehicle] = useState<Vehicle | null>(null);

  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseValue, setNewExpenseValue] = useState("");
  const [newExpenseCat, setNewExpenseCat] = useState<Category>("Mechanics");
  const [newExpenseRecurrence, setNewExpenseRecurrence] = useState<NonNullable<Expense["recurrence"]>>("One-time");
  const [newExpenseStartDate, setNewExpenseStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newExpenseEndDate, setNewExpenseEndDate] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const showError = (field: string, msg: string) => {
    setErrors(prev => ({ ...prev, [field]: msg }));
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }, 4000);
  };

  const handleSave = async () => {
    if (!draftVehicle) return;

    let hasError = false;
    if (!draftVehicle.name?.trim()) {
      showError("name", "O nome do veículo é obrigatório.");
      hasError = true;
    }
    if (draftVehicle.purchaseValue === undefined || draftVehicle.purchaseValue === null) {
      showError("purchaseValue", "O valor de compra é obrigatório.");
      hasError = true;
    }
    if (draftVehicle.saleValue === undefined || draftVehicle.saleValue === null) {
      showError("saleValue", "O valor de venda é obrigatório.");
      hasError = true;
    }

    if (!draftVehicle.licensePlate?.trim()) {
      showError("licensePlate", "A placa do veículo é obrigatória.");
      hasError = true;
    } else {
      const plateRegex = /^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/i;
      if (!plateRegex.test(draftVehicle.licensePlate.trim())) {
        showError("licensePlate", "Placa inválida. Use o formato AAA-1234 ou AAA1A23.");
        hasError = true;
      }
    }

    if (!draftVehicle.renavam?.trim()) {
      showError("renavam", "O renavam do veículo é obrigatório.");
      hasError = true;
    } else {
      const renavamRegex = /^[0-9]{11}$/;
      if (!renavamRegex.test(draftVehicle.renavam.trim())) {
        showError("renavam", "O Renavam deve ter exatamente 11 números.");
        hasError = true;
      }
    }

    if (draftVehicle.saleValue !== null && draftVehicle.purchaseValue !== null && draftVehicle.saleValue < draftVehicle.purchaseValue) {
      showError("saleValue", "O valor de venda deve ser maior que o valor de compra.");
      hasError = true;
    }
    if (hasError) return;

    setIsSaving(true);
    try {
      const isNew = !draftVehicle.id;
      let res: { data: Vehicle };

      const payload = { ...draftVehicle };
      payload.purchaseValue = Number(payload.purchaseValue) || 0;
      payload.saleValue = Number(payload.saleValue) || 0;
      payload.entryDate = toISODate(payload.entryDate) || payload.entryDate;
      if (payload.saleDate) payload.saleDate = toISODate(payload.saleDate) || payload.saleDate;
      
      if (payload.expenses?.length) {
        payload.expenses = payload.expenses.map((exp: Expense) => ({
          ...exp,
          startDate: toISODate(exp.startDate),
          endDate: toISODate(exp.endDate) || null,
        }));
      }

      if (!payload.buyerDoc) delete payload.buyerDoc;
      if (!payload.buyerName) delete payload.buyerName;

      if (isNew) {
        res = await api.post(`/vehicles`, payload);
        setVehicles([...vehicles, res.data]);
      } else {
        res = await api.patch(`/vehicles/${payload.id}`, payload);
        setVehicles(vehicles.map(v => v.id === draftVehicle.id ? res.data : v));
      }
      setActiveVehicle(null);
      showToast(isNew ? "Veículo cadastrado com sucesso!" : "Veículo atualizado com sucesso!", "success");
    } catch (e) {
      console.error(e);
      const errorMessage = (e as any).response?.data?.message || "Erro ao salvar o veículo. Tente novamente.";
      showToast(errorMessage, "error");
      
      if (errorMessage.includes("Renavam")) {
        showError("renavam", errorMessage);
      } else if (errorMessage.includes("Placa")) {
        showError("licensePlate", errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderFullscreenGallery = () => {
    if (!fullscreenImage) return null;

    let galeria = [fullscreenImage];
    if (draftVehicle) {
      galeria = draftVehicle.gallery;
    } else {
      const vehicle = vehicles.find(v => v.gallery.includes(fullscreenImage));
      if (vehicle) galeria = vehicle.gallery;
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

        <div className="relative w-[90vw] h-[90vh]">
          <Image src={fullscreenImage} fill className="object-contain rounded-lg relative z-0" alt="Preview" unoptimized />
        </div>
      </div>
    );
  };

  if (!activeVehicle || !draftVehicle) {
    return renderFullscreenGallery();
  }



  const handleUpdate = <K extends keyof Vehicle>(field: K, value: Vehicle[K]) => {
    if (isVendedor) return;
    setDraftVehicle(prev => prev ? { ...prev, [field]: value } : null);
  };

  const getMultiplier = (recurrence: string, startDate: string, endDate: string) => {
    if (recurrence === 'One-time' || !startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 1;

    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    switch (recurrence) {
      case 'Daily': return diffDays;
      case 'Weekly': return Math.ceil(diffDays / 7);
      case 'Biweekly': return Math.ceil(diffDays / 15);
      case 'Monthly': return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      case 'Yearly': return end.getFullYear() - start.getFullYear() + 1;
      default: return 1;
    }
  };

  const handleAddExpense = () => {
    const isRecurrent = newExpenseRecurrence !== 'One-time';
    if (!newExpenseName || !newExpenseValue || (isRecurrent && !newExpenseStartDate)) return;

    const multiplier = getMultiplier(newExpenseRecurrence, newExpenseStartDate, newExpenseEndDate || "");
    const unitValue = Number(newExpenseValue);
    const totalValue = unitValue * multiplier;

    const newId = Date.now().toString();
    const newExp: Expense = {
      id: newId,
      name: newExpenseName,
      value: totalValue,
      unitValue: unitValue,
      category: newExpenseCat,
      recurrence: newExpenseRecurrence,
      linkedVehicleId: draftVehicle.id,
      startDate: newExpenseStartDate,
      endDate: newExpenseEndDate || undefined
    };

    setDraftVehicle({
      ...draftVehicle,
      expenses: [...draftVehicle.expenses, newExp]
    });

    setNewExpenseName("");
    setNewExpenseValue("");
    setNewExpenseRecurrence("One-time");
    setNewExpenseStartDate(new Date().toISOString().split('T')[0]);
    setNewExpenseEndDate("");
  };

  const handleRemoveExpense = (id: string) => {
    setDraftVehicle({
      ...draftVehicle,
      expenses: draftVehicle.expenses.filter(e => e.id !== id)
    });
  };

  const handleEditExpense = (expense: Expense) => {
    setNewExpenseName(expense.name);
    setNewExpenseValue((expense.unitValue || expense.value).toString());
    setNewExpenseCat(expense.category || "Mechanics");
    setNewExpenseRecurrence(expense.recurrence || "One-time");
    setNewExpenseStartDate(expense.startDate || new Date().toISOString().split('T')[0]);
    setNewExpenseEndDate(expense.endDate || "");
    if (expense.id) handleRemoveExpense(expense.id);
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
              {!draftVehicle.id ? "Adicionar Veículo" : activeVehicle?.status === "Sold" ? "Visualizar Veículo Vendido" : "Editar Veículo"}
            </h2>
            <button onClick={handleCloseAttempt} className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Header / Info */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Nome do Veículo <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={draftVehicle.name}
                    disabled={activeVehicle?.status === "Sold"}
                    onChange={(e) => handleUpdate("name", e.target.value)}
                    className={`w-full text-lg font-bold text-stone-900 bg-stone-50 outline-none border ${errors.name ? 'border-red-500' : 'border-stone-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-3 pl-11 pr-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.name}</p>}
              </div>

              <div className="mb-5">
                <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Descrição (Opcional)</label>
                <textarea
                  value={draftVehicle.description || ""}
                  disabled={activeVehicle?.status === "Sold"}
                  onChange={(e) => handleUpdate("description", e.target.value)}
                  placeholder="Detalhes adicionais sobre o veículo..."
                  rows={2}
                  className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-3 px-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Placa <span className="text-red-500">*</span></label>
                  <IMaskInput
                    mask={[
                      { mask: 'aaa-0000' }, // Placa antiga
                      { mask: 'aaa0a00' }   // Placa Mercosul
                    ]}
                    prepare={(str) => str.toUpperCase()}
                    type="text"
                    placeholder="ABC-1234"
                    value={draftVehicle.licensePlate || ""}
                    disabled={activeVehicle?.status === "Sold"}
                    onAccept={(value) => handleUpdate("licensePlate", value.toUpperCase())}
                    className={`w-full font-medium text-stone-700 bg-stone-50 outline-none border ${errors.licensePlate ? 'border-red-500' : 'border-stone-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all uppercase disabled:opacity-70 disabled:cursor-not-allowed`}
                  />
                  {errors.licensePlate && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.licensePlate}</p>}
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Renavam <span className="text-red-500">*</span></label>
                  <IMaskInput
                    mask="00000000000"
                    type="text"
                    value={draftVehicle.renavam || ""}
                    disabled={activeVehicle?.status === "Sold"}
                    onAccept={(value) => handleUpdate("renavam", value)}
                    className={`w-full font-medium text-stone-700 bg-stone-50 outline-none border ${errors.renavam ? 'border-red-500' : 'border-stone-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
                  />
                  {errors.renavam && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.renavam}</p>}
                </div>
                {!isVendedor && (
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Valor de Compra (R$) <span className="text-red-500">*</span></label>
                    <NumericFormat
                      value={draftVehicle.purchaseValue}
                      disabled={activeVehicle?.status === "Sold"}
                      onFocus={(e) => e.target.select()}
                      onValueChange={(values) => {
                        if (values.floatValue === undefined) {
                          handleUpdate("purchaseValue", null);
                          setTimeout(() => handleUpdate("purchaseValue", 0), 0);
                        } else {
                          handleUpdate("purchaseValue", values.floatValue);
                        }
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      className={`w-full font-medium text-stone-700 bg-stone-50 outline-none border ${errors.purchaseValue ? 'border-red-500' : 'border-stone-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
                    />
                    {errors.purchaseValue && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.purchaseValue}</p>}
                  </div>
                )}
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Valor de Venda (R$) <span className="text-red-500">*</span></label>
                  <NumericFormat
                    value={draftVehicle.saleValue}
                    disabled={activeVehicle?.status === "Sold"}
                    onFocus={(e) => e.target.select()}
                    onValueChange={(values) => {
                      if (values.floatValue === undefined) {
                        handleUpdate("saleValue", null);
                        setTimeout(() => handleUpdate("saleValue", 0), 0);
                      } else {
                        handleUpdate("saleValue", values.floatValue);
                      }
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    className={`w-full font-medium text-stone-700 bg-stone-50 outline-none border ${errors.saleValue ? 'border-red-500' : 'border-stone-200'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
                  />
                  {errors.saleValue && <p className="text-red-500 text-xs mt-1 animate-in fade-in">{errors.saleValue}</p>}
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Data de Entrada</label>
                  <DateInput
                    value={draftVehicle.entryDate}
                    disabled={activeVehicle?.status === "Sold"}
                    onChangeDate={(val) => handleUpdate("entryDate", val)}
                    className="w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2 block">Status</label>
                  <select
                    value={draftVehicle.status}
                    disabled={activeVehicle?.status === "Sold"}
                    onChange={(e) => {
                      const newStatus = e.target.value as "In Stock" | "Maintenance" | "Sold";
                      if (newStatus === "Sold") {
                        handleUpdate("status", "Sold");
                        handleUpdate("saleDate", new Date().toISOString().split('T')[0]);
                      } else {
                        handleUpdate("status", newStatus);
                        handleUpdate("saleDate", undefined);
                      }
                    }}
                    className={`w-full font-medium text-stone-700 bg-stone-50 outline-none border border-stone-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 px-4 transition-all ${activeVehicle?.status === "Sold" ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {Object.entries(VehicleStatusEnum).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                {draftVehicle.status === "Sold" && (
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
                        <label className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-2 block">Data de Saída</label>
                        <DateInput
                          value={draftVehicle.saleDate || ""}
                          disabled={activeVehicle?.status === "Sold"}
                          onChangeDate={(val) => handleUpdate("saleDate", val)}
                          className="w-full font-medium text-stone-700 bg-white outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-2 px-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-2 block">Nome do Comprador</label>
                        <input
                          type="text"
                          placeholder="Ex: João da Silva"
                          value={draftVehicle.buyerName || ""}
                          disabled={activeVehicle?.status === "Sold"}
                          onChange={(e) => handleUpdate("buyerName", e.target.value)}
                          className="w-full font-medium text-stone-700 bg-white outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-2 px-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-2 block">CPF/CNPJ</label>
                        <IMaskInput
                          mask={[
                            { mask: '000.000.000-00' },
                            { mask: '00.000.000/0000-00' }
                          ]}
                          placeholder="000.000.000-00"
                          value={draftVehicle.buyerDoc || ""}
                          disabled={activeVehicle?.status === "Sold"}
                          onAccept={(value) => handleUpdate("buyerDoc", value)}
                          className="w-full font-medium text-stone-700 bg-white outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-2 px-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Gallery */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-800 mb-4 uppercase tracking-wider">Galeria de Imagens</h3>
              <div className="grid grid-cols-4 gap-3">
                {draftVehicle.gallery.map((img, i) => (
                  <div key={i} className="aspect-square bg-stone-100 rounded-lg overflow-hidden group relative shadow-sm border border-stone-200">
                    <Image src={img} fill className="object-cover cursor-pointer hover:scale-105 transition-transform" alt="gallery" onClick={() => setFullscreenImage(img)} unoptimized />
                    {activeVehicle?.status !== 'Sold' && (
                      <button
                        onClick={() => {
                          const newGal = draftVehicle.gallery.filter((_, idx) => idx !== i);
                          handleUpdate("gallery", newGal);
                          if (draftVehicle.image === img) {
                            handleUpdate("image", newGal[0] || "");
                          }
                        }}
                        className="absolute top-2 right-2 bg-rose-500/90 text-white lg:opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-600 transition-all shadow-sm backdrop-blur-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {activeVehicle?.status !== 'Sold' && (
                  <ImageUploader 
                    onImageUploaded={(base64Str) => {
                      setDraftVehicle({
                        ...draftVehicle,
                        image: draftVehicle.image || base64Str,
                        gallery: [...draftVehicle.gallery, base64Str]
                      });
                    }}
                  >
                    {({ onClick, isUploading }) => (
                      <button
                        onClick={onClick}
                        disabled={isUploading}
                        className="aspect-square bg-stone-50 border-2 border-dashed border-stone-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:text-blue-500 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 size={24} className="animate-spin mb-2" /> : <Camera size={24} className="mb-2" />}
                        <span className="text-[11px] font-semibold uppercase tracking-wider">{isUploading ? 'Adicionando...' : 'Adicionar'}</span>
                      </button>
                    )}
                  </ImageUploader>
                )}
              </div>
            </div>

            {/* Expenses */}
            {!isVendedor && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-sm font-semibold text-stone-800 mb-4 uppercase tracking-wider">Despesas do Veículo</h3>

                <div className="space-y-3 mb-6">
                  {draftVehicle.expenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-center p-3.5 bg-stone-50 hover:bg-[#FDFBF7] border border-stone-200 hover:border-stone-300 rounded-xl group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getCategoryColor(exp.category || "Others")} bg-white shadow-sm border border-stone-100`}>
                          {getCategoryIcon(exp.category || "Others")}
                        </div>
                        <span className="font-semibold text-stone-800 text-sm">{exp.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-stone-900">{formatCurrency(exp.value)}</span>
                        {activeVehicle?.status !== 'Sold' && (
                          <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleEditExpense(exp)} className="text-stone-300 hover:text-blue-500 p-1.5 bg-white border border-stone-200 rounded-md hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => exp.id && handleRemoveExpense(exp.id)} className="text-stone-300 hover:text-rose-500 p-1.5 bg-white border border-stone-200 rounded-md hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-sm">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {draftVehicle.expenses.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                      <p className="text-sm font-medium text-stone-500">Nenhuma despesa registrada para este veículo.</p>
                    </div>
                  )}
                </div>
                {/* Nova Despesa Form */}
                {activeVehicle?.status !== 'Sold' && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-sm mt-4">
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Plus size={14} /> Registrar Nova Despesa
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
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

                      <div className="sm:col-span-4">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase mb-1.5 block">Categoria</label>
                        <select
                          value={newExpenseCat}
                          onChange={e => setNewExpenseCat(e.target.value as Category)}
                          className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3.5 py-2 text-sm font-medium text-stone-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-shadow shadow-sm"
                        >
                          {Object.entries(CategoryEnum).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase mb-1.5 block">Recorrência</label>
                        <select
                          value={newExpenseRecurrence}
                          onChange={e => setNewExpenseRecurrence(e.target.value as RecurrenceType)}
                          className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3.5 py-2 text-sm font-medium text-stone-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-shadow shadow-sm"
                        >
                          {Object.entries(RecurrenceEnum).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {newExpenseRecurrence !== 'One-time' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-stone-100/50 rounded-xl border border-stone-200 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Data Início</label>
                          <DateInput
                            value={newExpenseStartDate}
                            onChangeDate={val => setNewExpenseStartDate(val)}
                            className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Data Fim (Opcional)</label>
                            <DateInput
                              value={newExpenseEndDate}
                              onChangeDate={val => setNewExpenseEndDate(val)}
                              className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-5 items-end">
                      <div className="sm:col-span-4">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase mb-1.5 block">
                          {newExpenseRecurrence === 'One-time' ? 'Valor (R$)' : 'Valor Unitário (R$)'}
                        </label>
                        <NumericFormat
                          placeholder="R$ 0,00"
                          value={newExpenseValue || ""}
                          onValueChange={(values) => setNewExpenseValue(values.floatValue?.toString() || "")}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="R$ "
                          className="w-full bg-white outline-none border border-stone-200 rounded-lg px-3.5 py-2 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-shadow shadow-sm"
                        />
                      </div>
                      {newExpenseRecurrence !== 'One-time' && (
                        <div className="sm:col-span-8 bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col justify-center shadow-sm">
                          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Total Estimado ({getMultiplier(newExpenseRecurrence, newExpenseStartDate, newExpenseEndDate || "")}x ocorrências)</span>
                          <span className="text-base font-bold text-blue-900">{formatCurrency(Number(newExpenseValue) * getMultiplier(newExpenseRecurrence, newExpenseStartDate, newExpenseEndDate || ""))}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-stone-200">
                      <button
                        onClick={handleAddExpense}
                        disabled={!newExpenseName || !newExpenseValue || (newExpenseRecurrence !== 'One-time' && !newExpenseStartDate)}
                        className="w-full sm:w-auto bg-stone-900 disabled:bg-stone-200 disabled:text-stone-400 text-white px-6 py-2.5 rounded-xl hover:bg-stone-800 hover:-translate-y-[1px] active:translate-y-0 transition-all font-semibold flex items-center justify-center gap-2 shadow-sm disabled:shadow-none"
                      >
                        <Plus size={16} /> <span>Adicionar Despesa</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isVendedor && activeVehicle?.status !== 'Sold' && (
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
          )}
        </div>
      </div>

      {/* Confirm Close Modal */}
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
                <AlertTriangle size={32} />
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
                  onClick={() => setActiveVehicle(null)}
                  className="flex-1 px-4 py-3 rounded-2xl font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 transition-all cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image View */}
      {renderFullscreenGallery()}
    </>
  );
}
