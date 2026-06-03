import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  LayoutGrid, 
  ShoppingBag, 
  ArrowRightLeft, 
  Crown, 
  User as UserIcon, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Award, 
  HeartPulse, 
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Zap,
  Target,
  TrendingUp,
  CalendarClock,
  Medal,
  Star
} from 'lucide-react';
import { User } from '../types';

export interface WelcomeSummary {
  rankPosition: number | null;
  totalRanked: number;
  nextRankedName?: string;
  pointsToNextRank?: number;
  engagementPercent: number;
  totalQuizCoins: number;
  maxQuizCoins: number;
  completedMetas: number;
  participatedMetas: number;
  stickersCollected: number;
  stickersTotal: number;
  lastActivityTitle?: string;
  lastActivityTime?: string;
  nextMetaId?: number;
  nextMetaTitle?: string;
  nextMetaCoins?: number;
  hasReleasedPendingMeta?: boolean;
}

interface WelcomeScreenProps {
  user: User;
  onNavigate: (tab: 'inicio' | 'desafios' | 'album' | 'loja' | 'trocas' | 'ranking' | 'perfil' | 'admin' | 'estudo') => void;
  summary?: WelcomeSummary;
}

export function WelcomeScreen({ user, onNavigate, summary }: WelcomeScreenProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const engagementPercent = summary?.engagementPercent ?? 0;
  const quizProgressLabel = `${summary?.totalQuizCoins ?? 0}/${summary?.maxQuizCoins ?? 900}`;
  const albumPercent = summary?.stickersTotal ? Math.round(((summary.stickersCollected || 0) / summary.stickersTotal) * 100) : 0;
  const rankLabel = summary?.rankPosition ? `${summary.rankPosition}º` : user.isAdmin ? 'Admin' : '--';
  const isChampion = summary?.rankPosition === 1;

  const baseItems = [
    {
      id: 'desafios',
      title: 'Desafios das 6 Metas',
      desc: 'Responda questionários de segurança, teste seus conhecimentos e acumule moedas.',
      icon: <Trophy className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-100 hover:border-emerald-300 bg-emerald-50/20 text-emerald-800'
    },
    {
      id: 'album',
      title: 'Álbum de Figurinhas',
      desc: 'Colecione figurinhas exclusivas sobre os protocolos internacionais de qualidade.',
      icon: <LayoutGrid className="w-6 h-6 text-brand-600" />,
      color: 'border-brand-100 hover:border-brand-300 bg-brand-50/20 text-brand-800'
    },
    {
      id: 'loja',
      title: 'Loja de Pacotes',
      desc: 'Abra pacotes surpresas e conquiste novas figurinhas para completar seu álbum.',
      icon: <ShoppingBag className="w-6 h-6 text-amber-600" />,
      color: 'border-amber-100 hover:border-amber-300 bg-amber-50/20 text-amber-800'
    },
    {
      id: 'trocas',
      title: 'Central de Trocas',
      desc: 'Negocie de forma justa suas figurinhas repetidas com outros colaboradores do HUSF.',
      icon: <ArrowRightLeft className="w-6 h-6 text-indigo-600" />,
      color: 'border-indigo-100 hover:border-indigo-300 bg-indigo-50/20 text-indigo-800'
    },
    {
      id: 'ranking',
      title: 'Ranking Geral',
      desc: 'Acompanhe a classificação individual e o desempenho geral dos setores.',
      icon: <Crown className="w-6 h-6 text-rose-600" />,
      color: 'border-rose-100 hover:border-rose-300 bg-rose-50/20 text-rose-800'
    },
    {
      id: 'perfil',
      title: 'Meu Perfil',
      desc: 'Confira seu saldo de moedas acumulado, progresso atualizado e dados cadastrais.',
      icon: <UserIcon className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-100 hover:border-blue-300 bg-blue-50/20 text-blue-800'
    }
  ] as const;

  const adminItem = {
    id: 'admin' as const,
    title: 'Painel Gestão e Controle',
    desc: 'Acesso exclusivo para monitoramento, auditorias, recompensas e gerenciamento das 6 metas.',
    icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
    color: 'border-purple-200 hover:border-purple-400 bg-purple-50/30 text-purple-950 border-2 shadow-purple-50/30 font-bold'
  };

  const navItems = user.isAdmin ? [adminItem, ...baseItems] : baseItems;

  const futureItems = [
    {
      title: 'Central de Aulas Curtas',
      desc: 'Vídeos micro-learning e infográficos rápidos sobre práticas seguras à beira do leito.',
      icon: <BookOpen className="w-5 h-5 text-slate-400" />,
      status: 'Em breve'
    },
    {
      title: 'Simulador de Casos Práticos',
      desc: 'Interações baseadas em cenários clínicos reais do hospital para tomada de decisão segura.',
      icon: <HeartPulse className="w-5 h-5 text-slate-400" />,
      status: 'Segundo Semestre'
    },
    {
      title: 'Certificados e Conquistas',
      desc: 'Gere e faça download de certificados de proficiência em Segurança do Paciente.',
      icon: <Award className="w-5 h-5 text-slate-400" />,
      status: 'Planejado'
    },
    {
      title: 'Mural de Boas Práticas',
      desc: 'Canal de comunicação direta do setor de Qualidade com notícias essenciais.',
      icon: <MessageSquare className="w-5 h-5 text-slate-400" />,
      status: 'Em breve'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Strong collaborator dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#071f1a] via-brand-700 to-[#061437] rounded-3xl p-5 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-400 blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-25 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 opacity-20 pointer-events-none bg-[linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative z-10 grid xl:grid-cols-[1.35fr_.85fr] gap-6 lg:gap-8 items-stretch">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-white/12 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 border border-white/10 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Copa da Segurança
              </span>
              <span className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 border border-emerald-400/20 text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sessão ativa
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold safe-text font-[Space_Grotesk] leading-tight tracking-tight">
                {getGreeting()}, <span className="text-amber-300">{user.name}</span>!
              </h1>
              <p className="text-brand-50/95 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
                Sua evolução na Copa aparece aqui em tempo real: ranking, engajamento, metas, moedas e figurinhas.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs text-white/65 font-bold uppercase tracking-wider">Ranking</span>
                  <Medal className="w-5 h-5 text-amber-300" />
                </div>
                <p className="text-3xl font-black font-[Space_Grotesk]">{rankLabel}</p>
                <p className="text-xs text-white/60 mt-1">
                  {summary?.totalRanked ? `de ${summary.totalRanked} colaboradores` : 'classificação geral'}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs text-white/65 font-bold uppercase tracking-wider">Engajamento</span>
                  <Zap className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-3xl font-black font-[Space_Grotesk]">{engagementPercent}%</p>
                <div className="mt-2 h-2 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-300 rounded-full" style={{ width: `${Math.min(100, Math.max(0, engagementPercent))}%` }} />
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs text-white/65 font-bold uppercase tracking-wider">Pontos quiz</span>
                  <Target className="w-5 h-5 text-sky-300" />
                </div>
                <p className="text-3xl font-black font-[Space_Grotesk]">{summary?.totalQuizCoins ?? 0}</p>
                <p className="text-xs text-white/60 mt-1">{quizProgressLabel} pontos possíveis</p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs text-white/65 font-bold uppercase tracking-wider">Moedas</span>
                  <Coins className="w-5 h-5 text-amber-300" />
                </div>
                <p className="text-3xl font-black font-[Space_Grotesk]">{user.coins}</p>
                <p className="text-xs text-white/60 mt-1">disponíveis na carteira</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('desafios')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl p-4 text-sm sm:text-base font-black flex items-center justify-between gap-3 transition-all shadow-lg shadow-amber-950/10 active:scale-[0.98]"
              >
                <span>{summary?.hasReleasedPendingMeta ? 'Continuar desafio' : 'Ver desafios'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('ranking')}
                className="bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl p-4 text-sm sm:text-base font-bold flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
              >
                <span>Ver ranking</span>
                <Crown className="w-5 h-5 text-amber-300" />
              </button>
              <button
                onClick={() => onNavigate('album')}
                className="bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl p-4 text-sm sm:text-base font-bold flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
              >
                <span>Meu álbum</span>
                <LayoutGrid className="w-5 h-5 text-sky-200" />
              </button>
            </div>
          </div>

          <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/40 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Próxima jogada</p>
                  <h2 className="text-xl font-black text-slate-900 font-[Space_Grotesk] mt-0.5">
                    {summary?.nextMetaTitle || 'Acompanhe sua evolução'}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100 shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                {isChampion ? (
                  <div className="flex gap-3 items-start">
                    <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-slate-900">Você está liderando o ranking!</p>
                      <p className="text-sm text-slate-500 mt-0.5">Continue participando para manter a liderança da Copa.</p>
                    </div>
                  </div>
                ) : summary?.nextRankedName ? (
                  <div className="flex gap-3 items-start">
                    <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-slate-900">Faltam {summary.pointsToNextRank || 1} pontos para subir.</p>
                      <p className="text-sm text-slate-500 mt-0.5">Próximo alvo: {summary.nextRankedName}.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <TrendingUp className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-slate-900">Complete quizzes para entrar na disputa.</p>
                      <p className="text-sm text-slate-500 mt-0.5">Cada meta concluída melhora sua posição.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metas</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{summary?.completedMetas ?? 0}/6</p>
                  <p className="text-xs text-slate-500 mt-1">concluídas</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Álbum</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{albumPercent}%</p>
                  <p className="text-xs text-slate-500 mt-1">{summary?.stickersCollected ?? 0}/{summary?.stickersTotal ?? 0} figurinhas</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <CalendarClock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-black text-slate-800 safe-text">{summary?.lastActivityTitle || 'Nenhuma atividade registrada ainda'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{summary?.lastActivityTime || 'Responda um quiz para começar seu histórico.'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-brand-50 px-3 py-2.5 rounded-2xl border border-brand-100">
                <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                <p className="text-xs font-bold text-brand-900 safe-text">Setor: {user.sector}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Quick Navigation Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-[Space_Grotesk]">
            Seções do Aplicativo
          </h2>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Acesso rápido
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className={`text-left border-2 rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between group cursor-pointer ${item.color}`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-700 transition-colors font-[Space_Grotesk]">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-100/60 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-brand-600 transition-colors w-full">
                <span>Acessar {item.title.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Structured Space for Future Interactions banner */}
      <div className="space-y-5 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-[Space_Grotesk]">
            Próximas Novidades HUSF
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Estamos preparando recursos interativos adicionais para aprimorar sua jornada de aprendizado contínuo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 opacity-80 gap-5">
          {futureItems.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex gap-4 items-start relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-700 text-sm font-[Space_Grotesk]">
                    {item.title}
                  </h3>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    {item.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
