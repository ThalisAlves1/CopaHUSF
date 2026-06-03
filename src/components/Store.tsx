import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Coins, PackageOpen, CheckCircle2, Shield, Sparkles, Trophy, Star, Briefcase, Flame, Crown } from 'lucide-react';
import { PACKAGES, PackageDefinition, StickerDefinition } from '../lib/store';
import { playSound } from '../lib/audio';
import { StickerImage } from './StickerImage';

interface StoreProps {
  coins: number;
  onBuyPack: (packageId: string, cost: number) => StickerDefinition[];
}

export function Store({ coins, onBuyPack }: StoreProps) {
  const [openedStickers, setOpenedStickers] = useState<StickerDefinition[] | null>(null);
  const [openingPackage, setOpeningPackage] = useState<PackageDefinition | null>(null);
  const [step, setStep] = useState<'idle' | 'shaking' | 'revealing'>('idle');

  const getPackageIcon = (id: string, className: string) => {
    switch (id) {
      case 'plantao': return <Briefcase className={className} />;
      case 'elite': return <Sparkles className={className} />;
      case 'reliquia': return <Crown className={className} />;
      case 'final': return <Flame className={className} />;
      default: return <PackageOpen className={className} />;
    }
  };

  const handleBuy = (packageId: string, price: number) => {
    if (coins >= price) {
      const pkg = PACKAGES.find(p => p.id === packageId);
      if (pkg) {
        setOpeningPackage(pkg);
        setStep('shaking');
        playSound('success'); // Initial purchase sound
        
        const result = onBuyPack(packageId, price);
        setOpenedStickers(result);
        
        // Simulate pack tearing animation delay
        setTimeout(() => {
          setStep('revealing');
          playSound('cheer'); // Reveal sound
        }, 2500);
      }
    }
  };

  const closeReveal = () => {
    setOpeningPackage(null);
    setOpenedStickers(null);
    setStep('idle');
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'suprema': return 'bg-yellow-400 border-yellow-300 text-yellow-950 shadow-[0_0_30px_rgba(250,204,21,0.5)]';
      case 'lendaria': return 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-[0_0_30px_rgba(192,38,211,0.5)]';
      case 'holografica': return 'bg-cyan-400 border-cyan-300 text-cyan-950 shadow-[0_0_30px_rgba(34,211,238,0.5)]';
      default: return 'bg-slate-100 border-slate-300 text-slate-800 shadow-xl';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch(rarity) {
      case 'suprema': return <Trophy className="w-12 h-12 mb-3 text-yellow-700" />;
      case 'lendaria': return <Star className="w-12 h-12 mb-3 text-fuchsia-200" />;
      case 'holografica': return <Sparkles className="w-12 h-12 mb-3 text-cyan-800" />;
      default: return <Shield className="w-12 h-12 mb-3 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-500" />
            Loja Celso Cup
          </h2>
          <p className="text-slate-500 mt-1">Troque suas moedas por pacotes de figurinhas.</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-lg self-start sm:self-auto">
          <Coins className="w-6 h-6 text-amber-500" />
          {coins}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKAGES.map((pkg) => (
          <div key={pkg.id} className={`border-2 border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-md hover:border-slate-200`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${pkg.color} blur-2xl opacity-20 rounded-full pointer-events-none`} />
            
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${pkg.color} mb-6 shadow-sm`}>
              {pkg.category}
            </span>
            
            <div className={`mb-6 relative h-20 flex items-center justify-center`}>
              {pkg.imageUrl ? (
                <img src={pkg.imageUrl} alt={pkg.name} className="h-full object-contain drop-shadow-md" referrerPolicy="no-referrer" />
              ) : (
                <PackageOpen className={`w-20 h-20 ${pkg.color.replace('bg-', 'text-')}`} />
              )}
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 font-[Space_Grotesk] leading-tight flex-1 safe-text">{pkg.name}</h3>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-slate-500 mb-4 text-sm safe-text">{pkg.description}</p>
              <div className="bg-slate-50 text-slate-600 text-xs font-bold py-2 px-3 rounded-lg w-full mb-6 flex items-center justify-center border border-slate-100">
                ✔️ {pkg.guaranteed}
              </div>
            </div>
            
            <button 
              onClick={() => handleBuy(pkg.id, pkg.price)}
              disabled={coins < pkg.price || openingPackage !== null}
              className={`w-full text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm ${coins >= pkg.price && openingPackage === null ? 'bg-slate-800 hover:bg-slate-900' : 'bg-slate-300 cursor-not-allowed opacity-80'}`}
            >
              {openingPackage?.id === pkg.id ? (
                <motion.div
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 0.1 }}
                >
                  Processando...
                </motion.div>
              ) : (
                <>
                  {pkg.price} <Coins className="w-5 h-5 text-amber-400" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Abertura de Pacotes */}
      <AnimatePresence>
        {openingPackage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {step === 'shaking' && (
                <motion.div
                  key="pack"
                  initial={{ scale: 0.4, y: 150, opacity: 0, rotateZ: -10 }}
                  animate={{ 
                    scale: [0.4, 1, 1, 1.02, 0.98, 1.05, 1.1, 1.3],
                    rotateZ: [-10, 0, 0, -3, 3, -5, 5, 0],
                    y: [150, 0, -10, -10, -10, -15, -20, -30],
                    opacity: [0, 1, 1, 1, 1, 1, 1, 1],
                    filter: ['brightness(1)', 'brightness(1)', 'brightness(1)', 'brightness(1)', 'brightness(1.1)', 'brightness(1.3)', 'brightness(1.6)', 'brightness(2)']
                  }}
                  transition={{ 
                    duration: 2.5, 
                    times: [0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.85, 1], 
                    ease: "easeInOut" 
                  }}
                  exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }}
                  className={`w-48 sm:w-64 lg:w-80 aspect-[1/1.4] rounded-3xl sm:rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-4 sm:p-8 text-center border-4 sm:border-8 border-white/10 relative overflow-hidden ${openingPackage.color}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-60 pointer-events-none" />
                  {openingPackage.imageUrl ? (
                    <img src={openingPackage.imageUrl} alt={openingPackage.name} className="w-24 h-32 sm:w-40 sm:h-56 object-contain drop-shadow-xl mb-4 sm:mb-8 relative z-10" referrerPolicy="no-referrer" />
                  ) : (
                    getPackageIcon(openingPackage.id, "w-20 h-20 sm:w-32 sm:h-32 text-white drop-shadow-xl mb-4 sm:mb-8 relative z-10")
                  )}
                  <span className="bg-black/20 text-white font-bold tracking-widest text-[10px] sm:text-sm uppercase px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4 relative z-10 backdrop-blur-sm border border-white/20">
                    {openingPackage.category}
                  </span>
                  <h3 className="text-xl sm:text-3xl font-bold text-white font-[Space_Grotesk] relative z-10 leading-tight text-balance">
                    {openingPackage.name}
                  </h3>
                </motion.div>
              )}

              {step === 'revealing' && openedStickers && (
                <motion.div 
                  key="reveal"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl text-center relative z-10 flex flex-col h-full sm:h-auto items-center justify-center pt-8 sm:pt-0"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
                  
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 backdrop-blur-sm border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                      <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 font-[Space_Grotesk] drop-shadow-md">Pacote Aberto!</h2>
                    <p className="text-slate-300 mb-6 sm:mb-12 font-medium text-base sm:text-lg md:text-xl">Você tirou essas cartas:</p>
                  </motion.div>

                  <div className="flex justify-center items-center gap-2 sm:gap-6 lg:gap-10 mb-8 sm:mb-12 px-2 w-full max-w-sm sm:max-w-none mx-auto">
                    {openedStickers.map((sticker, idx) => {
                      const isRare = sticker.rarity !== 'regular';
                      return (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0.5, rotateY: 180, y: 50, opacity: 0 }}
                          animate={{ scale: 1, rotateY: 0, y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 + (idx * 0.15), type: 'spring', damping: 18, stiffness: 200 }}
                          className={`flex-1 aspect-[2.5/3.5] max-w-[110px] sm:max-w-[160px] md:max-w-[200px] sm:w-56 rounded-[10px] sm:rounded-2xl flex flex-col items-center justify-center p-1.5 sm:p-6 text-center border-2 sm:border-[6px] ${getRarityColor(sticker.rarity)} relative overflow-hidden group`}
                        >
                          {isRare && (
                            <div className="absolute top-0 bottom-0 left-0 w-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[60%] animate-shimmer pointer-events-none" />
                          )}
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + (idx * 0.15), type: 'spring' }}
                          >
                            <div className="scale-50 sm:scale-100 origin-center mb-0 sm:mb-0 w-full h-16 sm:h-24 flex items-center justify-center">
                              <StickerImage id={sticker.id} name={sticker.name} customImage={sticker.image} />
                            </div>
                          </motion.div>
                          <span className="font-bold text-[7px] sm:text-[11px] md:text-xs uppercase tracking-widest opacity-90 mb-0.5 sm:mb-3 block line-clamp-1">{sticker.rarity}</span>
                          <h4 className="font-bold text-[9px] sm:text-sm md:text-lg leading-[1.1] sm:leading-tight font-[Space_Grotesk] px-0.5 line-clamp-3">{sticker.name}</h4>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={closeReveal}
                    className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] inline-flex items-center gap-2 text-base sm:text-lg"
                  >
                    Colar no Álbum
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
