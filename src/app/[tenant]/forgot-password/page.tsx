"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AxiosError } from "axios";
import { authApi } from "@/services/api";
import { useData } from "@/context/DataContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { tenantId, tenantConfig } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    
    try {
      await authApi.post("/auth/forgot-password", { email });
      setStep("token");
    } catch (err) {
      const detail = (err as AxiosError<{ message?: string }>)?.response?.data?.message;
      setErrorMsg(detail || "Ocorreu um erro ao solicitar a recuperação. Verifique se o e-mail está correto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // Validate the 6-digit code
      await authApi.post("/auth/validate-token", { token });
      // If valid, redirect to the reset password page with the token
      router.push(`/${tenantId}/reset-password?token=${token}`);
    } catch {
      setErrorMsg("Código inválido ou expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Full Page Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      </div>

      <div className="w-full max-w-[500px] min-h-[540px] bg-white rounded-[2rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-center p-8 sm:p-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="w-full relative z-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="p-0.5 bg-stone-100 rounded-xl shadow-sm border border-stone-200">
              {tenantConfig.logoUrl && <Image src={tenantConfig.logoUrl} alt={`${tenantConfig.name} Logo`} width={48} height={48} className="rounded-[10px] object-cover" unoptimized />}
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-stone-900">{tenantConfig.name}</span>
          </div>

          {step === "email" ? (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-2">Recuperar senha</h2>
                <p className="text-stone-500 font-medium">Informe seu e-mail e enviaremos um código de 6 dígitos para criar uma nova senha.</p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRequestToken} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 block ml-1">Seu endereço de e-mail</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-stone-400 font-medium text-stone-800 shadow-sm"
                      placeholder="exemplo@apexmotors.com"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <span>Enviar código</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="animate-in slide-in-from-right duration-500">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50">
                  <KeyRound size={28} />
                </div>
                <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-2">Insira o código</h2>
                <p className="text-stone-500 font-medium">
                  Enviamos um código de 6 dígitos para <br/>
                  <span className="text-stone-800 font-bold">{email}</span>
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleValidateToken} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 block ml-1 text-center">Código de Segurança</label>
                  <input 
                    type="text" 
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="w-full text-center tracking-[0.5em] text-2xl py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-stone-300 font-bold text-stone-800 shadow-sm uppercase"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isLoading || token.length < 6}
                    className="relative w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <span>Validar Código</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-full mt-4 py-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    Tentar outro e-mail
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link href={`/${tenantId}/login`} className="inline-flex items-center gap-2 text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              <ArrowLeft size={16} />
              <span>Voltar para o login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
