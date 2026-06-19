import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  ChevronRight,
  Loader2,
  Medal,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { formatCPF, simulateLogin } from '../lib/auth';
import { isSupabaseConfigured, lastSupabaseError } from '../lib/supabase';
import { User as AppUser } from '../types';

interface LoginProps {
  onLoginSuccess: (user: AppUser) => void;
}

const highlights = [
  { icon: ShieldCheck, label: 'Competição' },
  { icon: Trophy, label: 'Engajamento' },
  { icon: Medal, label: 'Reconhecimento' },
];

const newEmployeeEmailHref = `mailto:diretoriaensino@husf.org.br?subject=${encodeURIComponent(
  'Solicitação de cadastro - Copa da Segurança'
)}&body=${encodeURIComponent(
  'Olá, Diretoria de Ensino e Pesquisa / NSP-Qualidade.\n\nSolicito o cadastro de novo funcionário na Copa da Segurança.\n\nNome completo: \nCPF: \nSetor: \n\nObrigado(a).'
)}`;

export function Login({ onLoginSuccess }: LoginProps) {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validatedUser, setValidatedUser] = useState<AppUser | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cpf.length !== 14) {
      setError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await simulateLogin(cpf);

      if (user) {
        setValidatedUser(user);
      } else if (!isSupabaseConfigured) {
        setError('Este aparelho/build está em modo local, sem conexão com o Supabase. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente/deploy e publique novamente.');
      } else if (lastSupabaseError) {
        setError(`Não foi possível consultar o Supabase: ${lastSupabaseError}`);
      } else {
        setError('CPF não encontrado na tabela husf_users. Confira se o colaborador foi cadastrado pelo admin e se o CPF está correto.');
      }
    } catch {
      setError('Erro ao conectar com o servidor. Tente novamente em alguns instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061018] text-white">
      {/* Imagem de fundo do login */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/images/login-bg.jpg')",
        }}
      />

      {/* Camada escura mais leve para a imagem aparecer melhor */}
      <div className="absolute inset-0 bg-black/25" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-3 py-6 pb-12 sm:px-6 sm:py-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-[780px]"
        >
          <div className="relative overflow-hidden rounded-[1.5rem] border border-amber-300/35 bg-white/[0.03] p-[1px] shadow-[0_32px_120px_rgba(0,0,0,.45)] backdrop-blur-sm sm:rounded-[2rem]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,214,102,.18),transparent_28%,rgba(59,130,246,.10)_82%,transparent)] opacity-45" />
            <div className="relative rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(8,35,24,.36),rgba(8,24,38,.42))] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-[2px] sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-14 lg:py-12">
              <div className="mx-auto mb-7 flex w-fit flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-amber-300/30 blur-2xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-amber-300/50 bg-[linear-gradient(145deg,#0d3b2d,#07172a)] shadow-[0_18px_50px_rgba(250,204,21,.14)] sm:h-32 sm:w-32 sm:rounded-[2rem]">
                    <div className="absolute -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-300 text-[#112019] shadow-lg shadow-amber-400/30">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <Shield className="absolute h-20 w-20 text-amber-300/18 sm:h-28 sm:w-28" strokeWidth={1.2} />
                    <Trophy className="relative h-12 w-12 text-amber-300 drop-shadow-[0_8px_18px_rgba(252,211,77,.35)] sm:h-16 sm:w-16" strokeWidth={1.8} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-amber-300">
                  <span className="h-px w-8 bg-amber-300/55 sm:w-14" />
                  <span className="whitespace-nowrap text-xs font-black uppercase tracking-[0.24em] sm:text-sm sm:tracking-[0.42em]">Copa da</span>
                  <span className="h-px w-8 bg-amber-300/55 sm:w-14" />
                </div>
                <h1 className="mt-2 max-w-full text-center text-[clamp(2.1rem,11vw,3.75rem)] font-black uppercase leading-none tracking-[0.03em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,.45)] sm:text-6xl sm:tracking-[0.08em]">
                  Segurança
                </h1>
                <div className="mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                <p className="mt-5 max-w-lg text-center text-base font-medium leading-relaxed text-slate-200/85 sm:text-lg">
                  Acompanhe sua pontuação, conquistas e figurinhas em tempo real.
                </p>
              </div>

              {validatedUser ? (
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mx-auto max-w-xl space-y-5"
                >
                  <div className="rounded-3xl border border-emerald-300/20 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] sm:p-6">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.9)]" />
                      Escalação encontrada
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-300 to-amber-600 text-2xl font-black text-[#071827] shadow-lg shadow-amber-500/15">
                        {validatedUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">Atleta registrado</p>
                        <h2 className="safe-text text-xl font-black uppercase leading-tight tracking-wide text-white sm:text-2xl">
                          {validatedUser.name}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
                        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Setor</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                          <Building2 className="h-4 w-4 shrink-0 text-amber-300" />
                          <span className="safe-text">{validatedUser.sector}</span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
                        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">CPF</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                          <span className="font-mono">{validatedUser.cpf}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onLoginSuccess(validatedUser)}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#071827] shadow-[0_18px_45px_rgba(245,158,11,.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(245,158,11,.34)] active:translate-y-0 sm:gap-3 sm:px-6 sm:text-base sm:tracking-[0.18em]"
                  >
                    Confirmar entrada
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setValidatedUser(null);
                      setCpf('');
                      setError('');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Não sou eu, alterar CPF
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 }}
                  onSubmit={handleSubmit}
                  className="mx-auto max-w-xl space-y-5"
                >
                  <div>
                    <label htmlFor="cpf" className="mb-3 block text-xs font-black uppercase tracking-[0.14em] text-white sm:text-sm sm:tracking-[0.22em]">
                      CPF
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-300/90" />
                      <input
                        id="cpf"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={cpf}
                        onChange={handleCpfChange}
                        placeholder="Digite seu CPF"
                        disabled={isLoading}
                        className={`w-full rounded-2xl border bg-black/20 px-14 py-4 text-lg font-bold tracking-wide text-white outline-none backdrop-blur placeholder:text-slate-400 transition-all focus:ring-4 ${
                          error
                            ? 'border-red-300/60 focus:border-red-300 focus:ring-red-400/10'
                            : 'border-white/15 focus:border-amber-300/70 focus:ring-amber-300/10'
                        }`}
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-semibold leading-relaxed text-red-100"
                      >
                        {error}
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || cpf.length !== 14}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#071827] shadow-[0_18px_45px_rgba(245,158,11,.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(245,158,11,.32)] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-600 disabled:text-slate-300 disabled:shadow-none sm:gap-3 sm:px-6 sm:text-base sm:tracking-[0.22em]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Entrando
                      </>
                    ) : (
                      <>
                        Entrar
                        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-slate-300">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    <p className="text-sm font-medium leading-relaxed">
                      Faça login para acessar seu perfil e acompanhar sua evolução.
                    </p>
                  </div>

                  <a
                    href={newEmployeeEmailHref}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-white/[0.06] px-4 py-3 text-center text-xs font-black uppercase tracking-[0.1em] text-amber-100 transition-all hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-white active:translate-y-0 sm:text-sm sm:tracking-[0.16em]"
                  >
                    Novo funcionário? Solicitar cadastro
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </motion.form>
              )}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-300/80 sm:gap-x-6 sm:text-xs sm:tracking-[0.18em]">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-amber-300" />
                    {item.label}
                  </div>
                  {index < highlights.length - 1 && <Award className="hidden h-3 w-3 text-amber-300/70 sm:block" />}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
