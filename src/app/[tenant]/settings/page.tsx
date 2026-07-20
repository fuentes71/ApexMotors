"use client";

import { useData } from "@/context/DataContext";
import { Header } from "@/components/Header";
import { 
  Settings as SettingsIcon, 
  FileText, 
  Info, 
  MessageCircle, 
  Building2, 
  CheckCircle2, 
  Save, 
  Undo2, 
  Upload
} from "lucide-react";
import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import api from "@/services/api";
import { ImageUploader } from "@/components/ImageUploader";

type Tab = 'geral' | 'pdf' | 'whatsapp';

export default function SettingsPage() {
  const { tenantConfig, contractTemplate, setContractTemplate, whatsappTemplates, setWhatsappTemplates } = useData();
  
  const [activeTab, setActiveTab] = useState<Tab>('geral');
  
  // Draft states
  const [templateDraft, setTemplateDraft] = useState(contractTemplate);
  const [whatsappDraft, setWhatsappDraft] = useState(whatsappTemplates);
  const [geralDraft, setGeralDraft] = useState({ name: tenantConfig?.name || '', logoUrl: tenantConfig?.logoUrl || '' });
  
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [prevTemplate, setPrevTemplate] = useState(contractTemplate);
  const [prevWhatsapp, setPrevWhatsapp] = useState(whatsappTemplates);

  if (contractTemplate !== prevTemplate) {
    setPrevTemplate(contractTemplate);
    setTemplateDraft(contractTemplate);
  }

  if (whatsappTemplates !== prevWhatsapp) {
    setPrevWhatsapp(whatsappTemplates);
    setWhatsappDraft(whatsappTemplates);
  }

  const DEFAULT_CONTRACT_TEMPLATE = `Pelo presente instrumento, eu, {{buyerName}}, inscrito(a)
no CPF/CNPJ sob o nº {{buyerDoc}}, declaro ter comprado o veículo abaixo
descrito da empresa {{sellerName}},
inscrita no CNPJ sob o nº {{sellerDoc}}.

DADOS DO VEÍCULO:
- Veículo: {{vehicleName}}
- Placa: {{vehiclePlaca}}
- Renavam: {{vehicleRenavam}}
- Valor Acordado: {{vehiclePrice}}

Declaro ainda ter recebido o veículo nas condições em que se encontra e
totalmente livre de desembaraços e débitos até a presente data, tornando-me
responsável a partir deste momento por quaisquer multas, impostos ou taxas.`;

  const DEFAULT_WHATSAPP_TEMPLATES = {
    lead_interest: "Olá, {{firstName}}! Tudo bem? Vi que você tem interesse em: *{{interest}}*. Gostaríamos de conversar sobre algumas opções que temos disponíveis!",
    lead_noInterest: "Olá, {{firstName}}! Tudo bem? Em que podemos te ajudar hoje? Temos diversas opções na loja que podem te interessar!",
    negociando_interest: "Olá, {{firstName}}! Tudo bem? Gostaria de saber se você conseguiu pensar na nossa proposta sobre o *{{interest}}*? Qualquer dúvida estou à disposição.",
    negociando_noInterest: "Olá, {{firstName}}! Tudo bem? Como estão as coisas? Gostaria de tirar alguma dúvida sobre as opções que vimos?",
    cliente_interest: "Olá, {{firstName}}! Tudo bem? Como está a experiência com seu novo *{{interest}}*? Estamos à disposição para qualquer dúvida ou revisão!",
    cliente_noInterest: "Olá, {{firstName}}! Tudo bem? Lembramos de você por aqui! Como estão as coisas? Se precisar de alguma manutenção ou avaliação, nos avise."
  };

  const handleRestoreDefaults = async () => {
    try {
      if (activeTab === 'pdf') {
        setTemplateDraft(DEFAULT_CONTRACT_TEMPLATE);
      } else if (activeTab === 'whatsapp') {
        setWhatsappDraft(DEFAULT_WHATSAPP_TEMPLATES);
      }
    } catch (error) {
      console.error("Error restoring settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload: any = {};
      if (activeTab === 'geral') {
        payload.name = geralDraft.name;
        payload.logoUrl = geralDraft.logoUrl;
      } else if (activeTab === 'pdf') {
        payload.pdfTemplate = templateDraft;
      } else if (activeTab === 'whatsapp') {
        payload.whatsappTemplates = whatsappDraft;
      }
      
      await api.patch('/tenants/settings', payload);
      
      if (activeTab === 'geral') {
        window.location.reload();
      } else if (activeTab === 'pdf') {
        setContractTemplate(templateDraft);
      } else if (activeTab === 'whatsapp') {
        setWhatsappTemplates(whatsappDraft);
      }
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Building2 },
    { id: 'pdf', label: 'Recibo PDF', icon: FileText },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ] as const;

  return (
    <AdminGuard>
      <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto bg-stone-50/50">
        <Header />
        <main className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Configurações</h1>
              <p className="text-stone-500 text-sm mt-1">Gerencie as informações e modelos do sistema.</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-white text-indigo-700 shadow-sm border border-stone-200' 
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-stone-400'} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Content Pane */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-6 lg:p-8">
                {/* Geral Tab */}
                {activeTab === 'geral' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-stone-900">Informações Gerais</h2>
                      <p className="text-sm text-stone-500 mt-1">Dados principais da sua loja.</p>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          value={geralDraft.name}
                          onChange={(e) => setGeralDraft({...geralDraft, name: e.target.value})}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-stone-900 font-medium"
                          placeholder="Ex: Apex Motors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                          Logo da Empresa
                        </label>
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50 overflow-hidden relative group">
                            {geralDraft.logoUrl ? (
                              <img src={geralDraft.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <Building2 size={32} className="text-stone-300" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Upload className="text-white w-6 h-6" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <ImageUploader onImageUploaded={(url) => setGeralDraft({...geralDraft, logoUrl: url})}>
                              {({ onClick, isUploading }) => (
                                <button 
                                  onClick={onClick}
                                  disabled={isUploading}
                                  className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {isUploading ? 'Enviando...' : 'Alterar Logo'}
                                </button>
                              )}
                            </ImageUploader>
                            <p className="text-xs text-stone-500 mt-2">
                              Recomendado: PNG ou JPG, tamanho máximo 2MB. Fundo transparente.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Tab */}
                {activeTab === 'pdf' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-stone-900">Modelo do Recibo de Venda (PDF)</h2>
                      <p className="text-sm text-stone-500 mt-1">Configure o texto padrão para geração de recibos.</p>
                    </div>
                    
                    <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-3 text-sm text-indigo-800">
                      <Info size={18} className="flex-shrink-0 mt-0.5 text-indigo-500" />
                      <div>
                        <p className="font-medium mb-1">Como usar variáveis:</p>
                        <p className="text-indigo-700/80 mb-2">
                          Você pode utilizar tags especiais que serão substituídas automaticamente pelos dados reais na hora de gerar o PDF.
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-indigo-700/80">
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

                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">
                        Texto do Contrato
                      </label>
                      <textarea 
                        value={templateDraft}
                        onChange={e => setTemplateDraft(e.target.value)}
                        className="w-full min-h-[350px] p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y font-mono text-sm leading-relaxed text-stone-800"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}

                {/* WhatsApp Tab */}
                {activeTab === 'whatsapp' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-stone-900">Mensagens Automáticas do WhatsApp</h2>
                      <p className="text-sm text-stone-500 mt-1">Personalize as mensagens para cada etapa do funil.</p>
                    </div>
                    
                    <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex gap-3 text-sm text-emerald-800">
                      <Info size={18} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                      <div>
                        <p className="font-medium mb-1">Dica de Variáveis:</p>
                        <p className="text-emerald-700/80">
                          Use <code>{`{{firstName}}`}</code> para o nome do cliente e <code>{`{{interest}}`}</code> para inserir o veículo de interesse. Você tem controle total sobre o texto, desde a saudação!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Lead */}
                      <div>
                        <h3 className="text-sm font-bold text-stone-800 mb-3 border-b border-stone-100 pb-2">Status: Lead / Frio</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Com Interesse Definido</label>
                            <textarea 
                              value={whatsappDraft.lead_interest}
                              onChange={e => setWhatsappDraft({...whatsappDraft, lead_interest: e.target.value})}
                              className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-stone-800 resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Sem Interesse Definido</label>
                            <textarea 
                              value={whatsappDraft.lead_noInterest}
                              onChange={e => setWhatsappDraft({...whatsappDraft, lead_noInterest: e.target.value})}
                              className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-stone-800 resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Negociando */}
                      <div>
                        <h3 className="text-sm font-bold text-stone-800 mb-3 border-b border-stone-100 pb-2">Status: Negociando</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Com Interesse Definido</label>
                            <textarea 
                              value={whatsappDraft.negociando_interest}
                              onChange={e => setWhatsappDraft({...whatsappDraft, negociando_interest: e.target.value})}
                              className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-stone-800 resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Sem Interesse Definido</label>
                            <textarea 
                              value={whatsappDraft.negociando_noInterest}
                              onChange={e => setWhatsappDraft({...whatsappDraft, negociando_noInterest: e.target.value})}
                              className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-stone-800 resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cliente */}
                      <div>
                        <h3 className="text-sm font-bold text-stone-800 mb-3 border-b border-stone-100 pb-2">Status: Cliente / Fechado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Com Interesse Definido</label>
                            <textarea 
                              value={whatsappDraft.cliente_interest}
                              onChange={e => setWhatsappDraft({...whatsappDraft, cliente_interest: e.target.value})}
                              className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-stone-800 resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Sem Interesse Definido</label>
                            <textarea 
                              value={whatsappDraft.cliente_noInterest}
                              onChange={e => setWhatsappDraft({...whatsappDraft, cliente_noInterest: e.target.value})}
                              className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-stone-800 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Footer Actions */}
              <div className="p-4 lg:p-6 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
                {activeTab !== 'geral' && (
                  <button
                    onClick={handleRestoreDefaults}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Undo2 size={18} />
                    Restaurar Padrões
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-6 py-2.5 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 ${
                    isSaved ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 size={18} />
                      Salvo com sucesso!
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
