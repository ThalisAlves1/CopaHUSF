import React, { useState, useMemo, useEffect } from 'react';
import { UserCheck, MessageSquare, Pill, Stethoscope, Droplets, ShieldAlert, Crown, ShieldCheck, Zap, Award, Trophy } from 'lucide-react';

interface StickerImageProps {
  id: number;
  name: string;
  className?: string;
  customImage?: string;
}

export function StickerImage({ id, name, className = "", customImage }: StickerImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const candidateSources = useMemo(() => {
    const list: string[] = [];
    const add = (src?: string | null) => {
      if (!src) return;
      const clean = src.trim();
      if (!clean) return;
      if (!list.includes(clean)) list.push(clean);
    };

    const addWebpSibling = (src: string) => {
      if (/\.(png|jpg|jpeg)$/i.test(src)) {
        add(src.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
      }
    };

    if (customImage && customImage.trim().length > 0) {
      const trimmed = customImage.trim().replace('/src/assets/', '/assets/');

      if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        add(trimmed);
      } else if (trimmed.startsWith('/')) {
        addWebpSibling(trimmed);
        add(trimmed);
      } else {
        // If it is just a filename like "celso-conexao-meta2.png", resolve inside public/assets/images.
        addWebpSibling(`/assets/images/${trimmed}`);
        add(`/assets/images/${trimmed}`);
      }
    }

    // Public folder assets are served from /assets in Vite builds. Prefer lightweight WebP first.
    add(`/assets/images/sticker_${id}.webp`);
    add(`/assets/images/sticker_${id}.png`);
    add(`/assets/images/sticker_${id}.jpg`);
    add(`/assets/images/sticker_${id}.jpeg`);

    return list;
  }, [id, customImage]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadedSrc(null);

    const tryLoad = (index: number) => {
      if (!active) return;
      if (index >= candidateSources.length) {
        if (active) {
          setLoadedSrc(null);
          setLoading(false);
        }
        return;
      }

      const src = candidateSources[index];
      const img = new window.Image();

      img.onload = () => {
        if (!active) return;
        // Verify genuine image dimensions to avoid 0x0 empty files
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setLoadedSrc(src);
          setLoading(false);
        } else {
          tryLoad(index + 1);
        }
      };

      img.onerror = () => {
        if (!active) return;
        tryLoad(index + 1);
      };

      img.src = src;
    };

    tryLoad(0);

    return () => {
      active = false;
    };
  }, [candidateSources]);

  const getStickerDetails = (stickerId: number) => {
    switch (stickerId) {
      // Page 1: Trabalho em Equipe
      case 1:
        return {
          icon: <UserCheck className="w-8 h-8 text-blue-500 animate-pulse" />,
          bgColor: "from-blue-50 to-blue-100/50",
          borderColor: "border-blue-200",
          label: "Identificação Paciente",
          iconContainer: "bg-blue-100 text-blue-600 border-blue-200"
        };
      case 2:
        return {
          icon: <MessageSquare className="w-8 h-8 text-indigo-500 animate-pulse" />,
          bgColor: "from-indigo-50 to-indigo-100/50",
          borderColor: "border-indigo-200",
          label: "Comunicação Efetiva",
          iconContainer: "bg-indigo-100 text-indigo-600 border-indigo-200"
        };
      case 3:
        return {
          icon: <Pill className="w-8 h-8 text-rose-500 animate-pulse" />,
          bgColor: "from-rose-50 to-rose-100/50",
          borderColor: "border-rose-200",
          label: "Medicamentos Seguros",
          iconContainer: "bg-rose-100 text-rose-600 border-rose-200"
        };
      case 4:
        return {
          icon: <Stethoscope className="w-8 h-8 text-amber-500 animate-pulse" />,
          bgColor: "from-amber-50 to-amber-100/50",
          borderColor: "border-amber-200",
          label: "Cirurgia Segura",
          iconContainer: "bg-amber-100 text-amber-600 border-amber-200"
        };
      case 5:
        return {
          icon: <Droplets className="w-8 h-8 text-cyan-500 animate-pulse" />,
          bgColor: "from-cyan-50 to-cyan-100/50",
          borderColor: "border-cyan-200",
          label: "Higiene das Mãos",
          iconContainer: "bg-cyan-100 text-cyan-600 border-cyan-200"
        };
      case 6:
        return {
          icon: <ShieldAlert className="w-8 h-8 text-orange-500 animate-pulse" />,
          bgColor: "from-orange-50 to-orange-100/50",
          borderColor: "border-orange-200",
          label: "Prevenção de Quedas",
          iconContainer: "bg-orange-100 text-orange-600 border-orange-200"
        };

      // Page 2: Evolução Contínua
      case 7:
        return {
          icon: <UserCheck className="w-8 h-8 text-teal-500 animate-bounce" />,
          bgColor: "from-teal-50 to-emerald-100/40",
          borderColor: "border-teal-300",
          label: "Identificação Ouro",
          iconContainer: "bg-teal-100 text-teal-700 border-teal-300 animate-pulse"
        };
      case 8:
        return {
          icon: <MessageSquare className="w-8 h-8 text-sky-500 animate-bounce" />,
          bgColor: "from-sky-50 to-blue-100/40",
          borderColor: "border-sky-300",
          label: "Comunicação Pró",
          iconContainer: "bg-sky-100 text-sky-700 border-sky-300 animate-pulse"
        };
      case 9:
        return {
          icon: <Pill className="w-8 h-8 text-fuchsia-500 animate-bounce" />,
          bgColor: "from-fuchsia-50 to-purple-100/40",
          borderColor: "border-fuchsia-300",
          label: "Medicamentos Pró",
          iconContainer: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 animate-pulse"
        };
      case 10:
        return {
          icon: <Stethoscope className="w-8 h-8 text-yellow-600 animate-bounce" />,
          bgColor: "from-yellow-50 to-amber-100/40",
          borderColor: "border-yellow-300",
          label: "Cirurgião Mestre",
          iconContainer: "bg-yellow-50 text-yellow-800 border-yellow-300 animate-pulse"
        };
      case 11:
        return {
          icon: <Droplets className="w-8 h-8 text-blue-500 animate-bounce" />,
          bgColor: "from-blue-50 to-cyan-100/45",
          borderColor: "border-blue-300",
          label: "Infecção Zero",
          iconContainer: "bg-blue-100 text-blue-700 border-blue-300 animate-pulse"
        };
      case 12:
        return {
          icon: <ShieldAlert className="w-8 h-8 text-violet-500 animate-bounce" />,
          bgColor: "from-violet-50 to-purple-100/45",
          borderColor: "border-violet-300",
          label: "Queda Zero",
          iconContainer: "bg-violet-100 text-violet-700 border-violet-300 animate-pulse"
        };

      // Page 3: Hall da Fama (Special & Rare)
      case 13: // Celso Paredão
        return {
          icon: <ShieldCheck className="w-10 h-10 text-cyan-400 animate-pulse" />,
          bgColor: "from-slate-900 to-cyan-950/80",
          borderColor: "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]",
          label: "Celso Paredão",
          iconContainer: "bg-cyan-950 text-cyan-300 border-cyan-500/50 animate-pulse"
        };
      case 14: // Speak Up
        return {
          icon: <Zap className="w-10 h-10 text-fuchsia-400 animate-bounce" />,
          bgColor: "from-slate-900 to-fuchsia-950/80",
          borderColor: "border-fuchsia-400 shadow-[0_0_15px_rgba(240,73,214,0.4)]",
          label: "Speak Up",
          iconContainer: "bg-fuchsia-950 text-fuchsia-300 border-fuchsia-500/50 animate-pulse"
        };
      case 15: // Lampião
        return {
          icon: <Award className="w-10 h-10 text-yellow-400 animate-bounce" />,
          bgColor: "from-slate-900 to-amber-950/80",
          borderColor: "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
          label: "Lampião",
          iconContainer: "bg-amber-950 text-amber-300 border-amber-500/50 animate-pulse"
        };
      case 16: // Mãos Limpas
        return {
          icon: <Droplets className="w-10 h-10 text-emerald-400 animate-pulse" />,
          bgColor: "from-slate-900 to-emerald-950/80",
          borderColor: "border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
          label: "Mãos Limpas",
          iconContainer: "bg-emerald-950 text-emerald-300 border-emerald-500/50 animate-pulse"
        };
      case 17: // Suprema Bola de Ouro
        return {
          icon: <Trophy className="w-12 h-12 text-yellow-400 animate-pulse" />,
          bgColor: "from-slate-950 via-yellow-950/50 to-slate-950",
          borderColor: "border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.6)]",
          label: "Bola de Ouro Suprema",
          iconContainer: "bg-yellow-950 text-yellow-300 border-yellow-400/50 animate-pulse"
        };

      default:
        return {
          icon: <Crown className="w-8 h-8 text-purple-500 animate-pulse" />,
          bgColor: "from-purple-50 to-indigo-100/40",
          borderColor: "border-purple-200",
          label: name || "Colecionável",
          iconContainer: "bg-purple-100 text-purple-600 border-purple-200"
        };
    }
  };

  const details = getStickerDetails(id);
  const isSpecial = id >= 13;

  if (loadedSrc) {
    return (
      <img
        src={loadedSrc}
        alt={name}
        className={`flex-1 w-full min-h-[110px] sm:min-h-[140px] object-contain drop-shadow-md mb-2 pointer-events-none mt-1 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div 
      className={`flex-1 w-full min-h-[110px] sm:min-h-[140px] rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden bg-gradient-to-b ${details.bgColor} select-none border-2 ${details.borderColor}`}
      style={{ contentVisibility: 'auto' }}
    >
      {/* Shiny background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #000 1.2px, transparent 1.2px)', backgroundSize: '10px 10px' }}></div>
      {isSpecial && (
        <div className="absolute top-0 bottom-0 left-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[60%] animate-shimmer pointer-events-none" />
      )}

      {/* Sticker Identification Badge */}
      <div className="absolute top-1 left-1 bg-black/10 text-[8px] font-black font-mono px-1.5 py-0.5 rounded text-slate-700 select-none">
        #{id}
      </div>

      {/* Outer Halo ring for high rare stickers */}
      <div className={`mt-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center shrink-0 shadow-sm relative ${details.iconContainer}`}>
        {details.icon}
      </div>

      {/* Sticker Name / Tag */}
      <div className="mt-2 text-center w-full px-1">
        <span 
          className={`text-[7.5px] sm:text-[9px] uppercase font-black tracking-widest block line-clamp-1 py-0.5 px-1.5 rounded-md mx-auto truncate lg:max-w-full ${
            id >= 17 ? 'bg-yellow-400/25 text-yellow-800' :
            id >= 15 ? 'bg-fuchsia-400/25 text-fuchsia-350' :
            id >= 13 ? 'bg-cyan-400/25 text-cyan-800' :
            'bg-slate-100 text-slate-700'
          }`}
        >
          {details.label}
        </span>
      </div>
    </div>
  );
}
