import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, Loader2, Building2, UserCheck, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { formatCPF, simulateLogin } from '../lib/auth';
import { isSupabaseConfigured, lastSupabaseError } from '../lib/supabase';
import { User } from '../types';


interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validatedUser, setValidatedUser] = useState<User | null>(null);

  const [showManualSync, setShowManualSync] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.length !== 14) {
      setError('Por favor, informe um CPF válido (11 dígitos).');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const user = await simulateLogin(cpf);
      if (user) {
        setValidatedUser(user);
      } else if (!isSupabaseConfigured) {
        setError('Este aparelho/build está em MODO LOCAL, sem conexão com o Supabase. Por isso ele só encontra usuários salvos neste navegador. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente/deploy e publique novamente.');
      } else if (lastSupabaseError) {
        setError(`Não foi possível consultar o Supabase: ${lastSupabaseError}`);
      } else {
        setError('CPF não encontrado na tabela husf_users do Supabase. Confira se o colaborador foi cadastrado pelo admin e se o CPF está correto.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-10 bg-[#080d15] relative overflow-hidden font-sans">
      {/* Immersive stadium layout background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948810_1px,transparent_1px),linear-gradient(to_bottom,#0d948810_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Smooth glowing orbs mimicking stadium floodlights in the corners */}
      <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-teal-500/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-teal-600/10 blur-[130px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-[32px] shadow-[0_30px_70px_rgba(0,18,15,0.45)] overflow-hidden flex flex-col lg:flex-row border border-white/20 relative z-10"
      >
        {/* Left Side: Brilliant Championship Logo Banner */}
        <div className="bg-gradient-to-br from-[#0c2e27] via-[#0d9488] to-[#04332d] p-8 md:p-12 lg:p-14 text-center text-white flex flex-col justify-between items-center lg:w-5/12 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-teal-800/20">
          {/* Subtle grid background mask */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#031c18_100%)] opacity-60 pointer-events-none" />
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%)] bg-[size:20px_20px] pointer-events-none mix-blend-overlay" />

          {/* HUSF Identity Tag */}
          <div className="relative z-10 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest text-teal-300 uppercase flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Hospital Universitário HUSF
          </div>

          {/* Championship Logo and Title Area */}
          <div className="my-auto py-8 flex flex-col items-center relative z-10">
            <motion.div
              initial={{ scale: 0.85, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.15 }}
              className="mb-8 relative"
            >
              {/* Radial glow directly behind the cup crown */}
              <div className="absolute inset-0 rounded-full bg-teal-400/20 blur-3xl pointer-events-none scale-110" />
              <img
                src="/assets/images/copa_metas_logo_clean_1779667992235.png"
                alt="Copa das Metas Shield"
                className="w-64 h-64 md:w-80 md:h-80 lg:w-[340px] lg:h-[340px] object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-300 relative z-10"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <h1 className="text-3xl lg:text-4xl font-black mb-3.5 leading-none font-[Space_Grotesk] tracking-wider uppercase bg-gradient-to-b from-white via-slate-100 to-teal-100 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Copa das Metas
            </h1>

            <p className="text-teal-50/80 text-sm leading-relaxed max-w-xs font-semibold">
              Treine e domine as <span className="text-amber-300 font-bold underline decoration-amber-400/55 decoration-2 underline-offset-4">6 Metas Internacionais</span> de Segurança do Paciente no nosso grande campeonato!
            </p>
          </div>

          {/* Bottom Accreditation Authority */}
          <div className="relative z-10 text-[10px] text-teal-300/60 font-black tracking-widest border-t border-white/10 pt-4 w-full uppercase">
            Diretoria de Ensino e Pesquisa
          </div>
        </div>

        {/* Right Side: High-Quality Interactive Line-up Form */}
        <div className="p-6 sm:p-10 md:p-14 lg:p-16 lg:w-7/12 flex flex-col justify-center bg-white">
          {validatedUser ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="space-y-6"
            >
              <div className="mb-6 text-center lg:text-left">
                <span className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-3.5 inline-flex items-center gap-2 border border-emerald-200 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Escalação Encontrada!
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 font-[Space_Grotesk] tracking-tight">Confirme sua Escalação</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Confirme seus dados profissionais abaixo para receber suas moedas e ingressar no campeonato.
                </p>
              </div>

              {/* Styled as a beautiful official Match Pass / Player Card */}
              <div className="bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-sm relative overflow-hidden">
                {/* Visual texture */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-[#0d9488]/5 blur-2xl rounded-full" />
                <div className="absolute left-0 bottom-0 w-24 h-24 bg-amber-500/5 blur-xl rounded-full" />

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-teal-500 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-md shadow-teal-600/15 shrink-0 border border-teal-500/20">
                    {validatedUser.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[9px] text-teal-600 font-extrabold uppercase tracking-widest bg-teal-50 px-2.5 py-0.5 rounded border border-teal-100 inline-block mb-1">
                      Atleta Registrado
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 font-[Space_Grotesk] leading-tight uppercase tracking-wide">
                      {validatedUser.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-slate-200/50 relative z-10">
                  <div className="bg-white/80 p-3 rounded-xl border border-slate-200/40 shadow-sm">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Setor Alocado</span>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <p className="text-xs font-bold leading-none truncate">{validatedUser.sector}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 p-3 rounded-xl border border-slate-200/40 shadow-sm">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Registro CPF</span>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs font-mono font-bold leading-none">{validatedUser.cpf}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => onLoginSuccess(validatedUser)}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 gap-2 cursor-pointer text-base uppercase tracking-wider"
                >
                  Confirmar Escalação / Jogar
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValidatedUser(null);
                    setCpf('');
                  }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors gap-2 cursor-pointer hover:text-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Não sou eu, alterar CPF
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 mb-2.5 font-[Space_Grotesk] tracking-tight">
                  Entre em Campo
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Insira o seu CPF para acessar o campeonato e iniciar a capacitação das 6 metas internacionais de segurança.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="cpf" className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                      Seu CPF de Acesso
                    </label>
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wide bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Cadastro Único
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      id="cpf"
                      type="text"
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      className={`w-full px-5 py-4 rounded-xl border-2 focus:ring-4 focus:outline-none transition-all duration-200 text-2xl tracking-widest text-center font-mono font-black ${
                        error 
                          ? 'border-red-300 focus:ring-red-100 focus:border-red-500 bg-red-50/5 text-red-700' 
                          : 'border-slate-200 focus:ring-teal-100 focus:border-[#0d9488] bg-slate-50/30'
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-red-500 text-xs font-bold mt-2.5 flex items-center gap-1.5 md:leading-relaxed bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-lg"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {error}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || cpf.length !== 14}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:opacity-40 disabled:from-slate-300 disabled:to-slate-300 disabled:pointer-events-none text-white font-extrabold py-4 px-4 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md shadow-teal-500/10 hover:shadow-lg cursor-pointer text-base uppercase tracking-wider"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Buscar Minha Ficha
                      <ArrowRight className="w-5 h-5 ml-2.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
