"use client";

import { useData } from "../../context/DataContext";
import { Header } from "../../components/Header";
import { Settings as SettingsIcon, FileText, Info } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { contractTemplate, setContractTemplate } = useData();
  const [templateDraft, setTemplateDraft] = useState(contractTemplate);
  const [isSaved, setIsSaved] = useState(false);

  const [prevTemplate, setPrevTemplate] = useState(contractTemplate);

  if (contractTemplate !== prevTemplate) {
    setPrevTemplate(contractTemplate);
    setTemplateDraft(contractTemplate);
  }

  const handleSave = () => {
    setContractTemplate(templateDraft);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto bg-white">
      <Header />
      <main className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-stone-100 text-stone-700 rounded-xl">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Configurações</h1>
            <p className="text-stone-500 text-sm mt-1">Ajuste as preferências e modelos do sistema.</p>
          </div>
        </div>

        <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-stone-700" />
            <h2 className="text-lg font-semibold text-stone-900">Modelo do Recibo de Venda (PDF)</h2>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 text-sm text-blue-800">
            <Info size={18} className="flex-shrink-0 mt-0.5 text-blue-500" />
            <div>
              <p className="font-medium mb-1">Como usar variáveis:</p>
              <p className="text-blue-700 mb-2">
                Você pode utilizar tags especiais que serão substituídas automaticamente pelos dados reais na hora de gerar o PDF.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li><code>{`{{buyerName}}`}</code> - Nome do Comprador</li>
                <li><code>{`{{buyerDoc}}`}</code> - CPF/CNPJ do Comprador</li>
                <li><code>{`{{vehicleName}}`}</code> - Nome do Veículo</li>
                <li><code>{`{{vehiclePlaca}}`}</code> - Placa do Veículo</li>
                <li><code>{`{{vehicleRenavam}}`}</code> - Renavam do Veículo</li>
                <li><code>{`{{vehiclePrice}}`}</code> - Valor da Venda</li>
                <li><code>{`{{sellerName}}`}</code> - Nome da Loja (ApexMotors)</li>
                <li><code>{`{{sellerDoc}}`}</code> - CNPJ da Loja</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">
                Texto do Contrato
              </label>
              <textarea 
                value={templateDraft}
                onChange={e => setTemplateDraft(e.target.value)}
                className="w-full min-h-[350px] p-4 bg-white border border-stone-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-y font-mono text-sm leading-relaxed text-stone-700"
                spellCheck={false}
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                {isSaved ? "Salvo com sucesso!" : "Salvar Modelo"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
