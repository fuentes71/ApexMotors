"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AxiosError } from "axios";
import { authApi } from "@/services/api";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordChecklist } from "@/components/ui/PasswordChecklist";
import { isPasswordValid, PASSWORD_MIN_LENGTH } from "@/utils/passwordRules";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { tenantId } = useData();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      // Validate token automatically on load
      authApi.post("/auth/validate-token", { token })
        .then(() => setIsValid(true))
        .catch(() => setIsValid(false))
        .finally(() => setIsValidating(false));
    } else {
      // eslint-disable-next-line
      setIsValidating(false);
       
      setIsValid(false);
    }
  }, [token]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!isPasswordValid(password)) {
      setErrorMsg(
        `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres, com maiúscula, minúscula, número e caractere especial.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
      showToast("Senha definida com sucesso!", "success");
      setTimeout(() => {
        router.push(`/${tenantId}/login`);
      }, 3000);
    } catch (err) {
      // The backend returns an array of messages when several rules fail.
      const detail = (err as AxiosError<{ message?: string | string[] }>)
        ?.response?.data?.message;
      setErrorMsg(
        (Array.isArray(detail) ? detail.join(" ") : detail) ||
          "Ocorreu um erro ao definir a senha."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
        <p className="text-stone-500 font-medium">Validando o seu link de acesso...</p>
      </div>
    );
  }

  if (!isValid && !success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 mb-3">Link Inválido ou Expirado</h2>
        <p className="text-stone-500 font-medium mb-8">
          O link de acesso que você utilizou não é mais válido. Por favor, solicite um novo.
        </p>
        <Link 
          href={`/${tenantId}/login`}
          className="inline-flex items-center justify-center px-6 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl font-bold transition-colors"
        >
          Voltar para o Login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-8 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 mb-3">Tudo Pronto!</h2>
        <p className="text-stone-500 font-medium mb-8">
          Sua senha foi definida com sucesso. Você já pode acessar o sistema.
        </p>
        <p className="text-sm text-stone-400">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-2">Definir Nova Senha</h2>
        <p className="text-stone-500 font-medium">Crie uma senha forte para acessar sua conta.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSetPassword} className="space-y-5">
        <PasswordInput
          label="Nova Senha"
          value={password}
          onChange={setPassword}
        />

        <PasswordChecklist password={password} />

        <PasswordInput
          label="Confirmar Senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="text-sm font-medium text-red-600 ml-1">
            As senhas não coincidem.
          </p>
        )}

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
                <span>Salvar Senha</span>
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  const { tenantConfig } = useData();

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

          <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
