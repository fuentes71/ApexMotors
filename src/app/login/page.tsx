"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Mail, Lock, Loader2, ArrowRight, Shield, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useData } from "../../context/DataContext";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleMockLogin = (role: 'Admin' | 'Vendedor') => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser({
        id: 'user-' + Date.now(),
        name: role === 'Admin' ? 'Admin (Mock)' : 'Vendedor (Mock)',
        email: role === 'Admin' ? 'admin@apexmotors.com' : 'vendedor@apexmotors.com',
        role,
        createdAt: new Date().toISOString()
      });
      setIsLoading(false);
      router.push("/");
    }, 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Full Page Gradient Background (No Grid) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      </div>

      {/* Centered Rectangle Container */}
      <div className="w-full max-w-[860px] min-h-[540px] bg-white rounded-[2rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] flex overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Left side - Aesthetic Graphic & Logo */}
        <div className="hidden lg:flex w-1/2 relative bg-[#09090b] items-center justify-center p-12 overflow-hidden">
          {/* Abstract Background pattern/gradient */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[80px] opacity-70 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          
          {/* Brand art */}
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center mt-[-40px]">
            <div className="inline-flex items-center justify-center p-1 bg-white/5 border border-white/10 rounded-3xl mb-8 backdrop-blur-xl shadow-2xl">
              <Image src="/logo.jpg" alt="ApexMotors Logo" width={96} height={96} className="rounded-2xl object-cover" />
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-stone-400 mb-4 leading-tight tracking-tight">
              Acelere a gestão<br />do seu estoque.
            </h1>
            <p className="text-stone-400 text-base leading-relaxed font-medium">
              Controle de ponta sobre veículos, finanças e negociações em uma plataforma moderna.
            </p>
            
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#09090b] bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-300 z-[${4-i}]`}>
                    <User size={14} />
                  </div>
                ))}
              </div>
              <p className="text-sm text-stone-500 font-medium ml-1">Usado por 2.000+ lojistas.</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 relative bg-white">
          <div className="w-full max-w-[360px] mx-auto relative z-10">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <div className="p-0.5 bg-stone-100 rounded-xl shadow-sm border border-stone-200">
                <Image src="/logo.jpg" alt="ApexMotors Logo" width={48} height={48} className="rounded-[10px] object-cover" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-stone-900">ApexMotors</span>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-2">Acessar conta</h2>
              <p className="text-stone-500 font-medium">Insira suas credenciais para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 block ml-1">Endereço de e-mail</label>
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

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-stone-700 block">Sua senha</label>
                  <a href="#" className="text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Esqueceu a senha?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-stone-400 font-medium text-stone-800 shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>Entrar no Dashboard</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-stone-400 font-bold uppercase tracking-widest">Contas de Teste</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => handleMockLogin('Admin')} 
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-4 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 text-sm font-bold rounded-2xl transition-all shadow-sm"
              >
                <Shield size={18} className="text-stone-400" />
                <span>Logar como Admin</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleMockLogin('Vendedor')} 
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-4 bg-indigo-50/50 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-sm font-bold rounded-2xl transition-all shadow-sm"
              >
                <User size={18} className="text-indigo-400" />
                <span>Logar Vendedor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
