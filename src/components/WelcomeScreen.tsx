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
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface WelcomeScreenProps {
  user: User;
  onNavigate: (tab: 'desafios' | 'album' | 'loja' | 'trocas' | 'ranking' | 'perfil' | 'admin') => void;
}

export function WelcomeScreen({ user, onNavigate }: WelcomeScreenProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

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
    desc: 'Acesso exclusivo para Monitoramento da Qualidade HUSF, auditorias, dar moedas e gerenciar as 6 metas.',
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
      desc: 'Canal de comunicação direta do setor de Qualidade HUSF com notícias essenciais.',
      icon: <MessageSquare className="w-5 h-5 text-slate-400" />,
      status: 'Em breve'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Welcome Hero Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500 blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500 blur-3xl opacity-30 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 border border-white/10 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Portal do Colaborador
            </span>
            <span className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 border border-emerald-400/20 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sessão Ativa e Segura
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-[Space_Grotesk] leading-tight tracking-tight">
              {getGreeting()}, <span className="text-amber-300">{user.name}</span>!
            </h1>
            
            <p className="text-brand-50 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
              Bem-vindo(a) de volta! Juntos, garantimos as melhores práticas assistenciais de proteção ao paciente do HUSF.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2.5 bg-black/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
              <Building2 className="w-5 h-5 text-brand-300 shrink-0" />
              <div>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider leading-none mb-1">Setor Alocado</p>
                <p className="text-sm font-bold text-white tracking-wide">{user.sector}</p>
              </div>
            </div>

            <div className="text-xs text-white/70 italic flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Abaixo estão os canais principais para navegação imediata.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Quick Navigation Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-[Space_Grotesk]">
            Seções do Aplicativo
          </h2>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Acesso Rápido
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
                <div className="flex items-center gap-2">
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
