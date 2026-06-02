import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, ScanLine, ArrowRightLeft, CheckCircle2, XCircle, AlertCircle, Trash2, ArrowRight, RefreshCcw } from 'lucide-react';
import { User } from '../types';
import { STICKER_CATALOG, StickerDefinition, getAllStickers, getStickerById, StickerRarity } from '../lib/store';
import { playSound } from '../lib/audio';
import confetti from 'canvas-confetti';
import { dbGetTrade, dbUpsertTrade } from '../lib/supabase';
import { StickerImage } from './StickerImage';

interface TradingProps {
  user: User;
  onTradeComplete: (givenStickerId: number, receivedStickerId: number) => void;
}

interface TradeSession {
  id: string; // 4 digits
  initiator: {
    userId: string;
    userName: string;
    stickerId: number;
    confirmed: boolean;
  };
  receiver?: {
    userId: string;
    userName: string;
    stickerId: number;
    confirmed: boolean;
  };
  status: 'pending' | 'negotiating' | 'completed' | 'cancelled';
  expiresAt: number;
}


export function Trading({ user, onTradeComplete }: TradingProps) {
  const [view, setView] = useState<'menu' | 'select_duplicate' | 'wait_partner' | 'scan_code' | 'select_counter' | 'negotiating' | 'success'>('menu');
  const [role, setRole] = useState<'none' | 'initiator' | 'receiver'>('none');
  const [activeTrade, setActiveTrade] = useState<TradeSession | null>(null);
  const [scanCode, setScanCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const stickerCounts = user.stickers.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const duplicates = Object.entries(stickerCounts)
    .filter(([_, count]) => count > 1)
    .map(([id]) => parseInt(id));

  const [rarityFilter, setRarityFilter] = useState<StickerRarity | 'all'>('all');

  const filteredDuplicates = duplicates.filter(id => {
    if (rarityFilter === 'all') return true;
    const s = getStickerById(id);
    return s?.rarity === rarityFilter;
  });

  // Polling for trade updates via Supabase DB with cache fallback
  useEffect(() => {
    if (!activeTrade || view === 'success' || view === 'menu') return;

    const interval = setInterval(async () => {
      const parsedTrade = await dbGetTrade(activeTrade.id);
      if (parsedTrade) {
        // Handle Expiration
        if (Date.now() > parsedTrade.expiresAt && parsedTrade.status !== 'completed' && parsedTrade.status !== 'cancelled') {
          parsedTrade.status = 'cancelled';
          await dbUpsertTrade(parsedTrade);
        }

        setActiveTrade(parsedTrade);

        // State Machine based on Role
        if (parsedTrade.status === 'cancelled') {
          setErrorMsg('A troca foi cancelada ou expirou.');
          setView('menu');
          playSound('error');
        } else if (parsedTrade.status === 'completed') {
          handleSuccess(parsedTrade);
        } else if (parsedTrade.status === 'negotiating' && view === 'wait_partner') {
          setView('negotiating');
          playSound('success');
        }
      } else {
        // Trade was deleted
        setErrorMsg('A sessão de troca não foi encontrada.');
        setView('menu');
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTrade, view]);

  const handleSuccess = (trade: TradeSession) => {
    if (role === 'initiator' && trade.receiver) {
      onTradeComplete(trade.initiator.stickerId, trade.receiver.stickerId);
    } else if (role === 'receiver' && trade.receiver) {
      onTradeComplete(trade.receiver.stickerId, trade.initiator.stickerId);
    }
    setView('success');
    playSound('cheer');
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    // Confetes verdes e amarelos
    const colors = ['#facc15', '#22c55e', '#16a34a', '#eab308'];

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const startTime = Date.now();

    const interval: any = setInterval(function() {
      const timeLeft = 3000 - (Date.now() - startTime);

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / 3000);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: colors
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: colors
      });
    }, 250);
  };

  const startTradeOffer = async (stickerId: number) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newTrade: TradeSession = {
      id: code,
      initiator: {
        userId: user.cpf,
        userName: user.name,
        stickerId,
        confirmed: false
      },
      status: 'pending',
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    await dbUpsertTrade(newTrade);
    setActiveTrade(newTrade);
    setRole('initiator');
    setView('wait_partner');
  };

  const joinTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scanCode.length !== 4) return;

    const trade = await dbGetTrade(scanCode);
    if (trade) {
      if (trade.status === 'pending' && Date.now() < trade.expiresAt) {
        if (trade.initiator.userId === user.cpf) {
          setErrorMsg('Você não pode negociar consigo mesmo.');
          return;
        }
        setActiveTrade(trade);
        setRole('receiver');
        setView('select_counter');
      } else {
        setErrorMsg('Código expirado ou inválido.');
      }
    } else {
      setErrorMsg('Código não encontrado.');
    }
  };

  const sendCounterOffer = async (stickerId: number) => {
    if (!activeTrade) return;
    
    const updatedTrade: TradeSession = {
      ...activeTrade,
      receiver: {
        userId: user.cpf,
        userName: user.name,
        stickerId,
        confirmed: false
      },
      status: 'negotiating'
    };
    
    await dbUpsertTrade(updatedTrade);
    setActiveTrade(updatedTrade);
    setView('negotiating');
  };

  const confirmTrade = async () => {
    if (!activeTrade) return;

    const latestTrade = await dbGetTrade(activeTrade.id);
    if (!latestTrade) return;
    
    if (role === 'initiator') latestTrade.initiator.confirmed = true;
    if (role === 'receiver' && latestTrade.receiver) latestTrade.receiver.confirmed = true;

    if (latestTrade.initiator.confirmed && latestTrade.receiver?.confirmed) {
      latestTrade.status = 'completed';
    }

    await dbUpsertTrade(latestTrade);
    setActiveTrade(latestTrade);
  };

  const cancelTrade = async () => {
    if (activeTrade) {
      const t = await dbGetTrade(activeTrade.id);
      if (t) {
        t.status = 'cancelled';
        await dbUpsertTrade(t);
      }
    }
    setActiveTrade(null);
    setRole('none');
    setView('menu');
  };


  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'suprema': return 'bg-yellow-400 border-yellow-300 text-yellow-950';
      case 'lendaria': return 'bg-fuchsia-600 border-fuchsia-400 text-white';
      case 'holografica': return 'bg-cyan-400 border-cyan-300 text-cyan-950';
      default: return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  };

  const renderStickerCard = (stickerId: number) => {
    const s = getStickerById(stickerId);
    if (!s) return null;
    return (
      <div className={`w-32 aspect-[2.5/3.5] rounded-xl flex flex-col items-center justify-center p-3 text-center border-[4px] ${getRarityColor(s.rarity)} shadow-md`}>
        <div className="flex-1 w-full min-h-0 flex flex-col justify-center">
          <StickerImage id={s.id} name={s.name} customImage={s.image?.startsWith('data:') ? s.image : undefined} />
        </div>
        <span className="font-bold text-[9px] uppercase tracking-widest opacity-90 mt-2 mb-1">{s.rarity}</span>
        <h4 className="font-bold text-[10px] leading-tight font-[Space_Grotesk] line-clamp-3">{s.name}</h4>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-brand-500" />
            Central de Trocas P2P
          </h2>
          <p className="text-slate-500 mt-1">Negocie suas figurinhas repetidas presencialmente com colegas.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} className="ml-auto text-red-500 hover:text-red-700"><XCircle className="w-5 h-5" /></button>
        </div>
      )}

      {view === 'menu' && (
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setView('select_duplicate')}
            className="group relative overflow-hidden bg-brand-50 hover:bg-brand-100 border-2 border-brand-200 rounded-3xl p-8 transition-all hover:scale-[1.02] text-left"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-200 rounded-full blur-2xl opacity-50 transition-transform group-hover:scale-150" />
            <QrCode className="w-12 h-12 text-brand-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-[Space_Grotesk]">Oferecer Figurinha</h3>
            <p className="text-slate-600 text-sm">Gere um código para enviar uma repetida sua.</p>
          </button>

          <button
            onClick={() => setView('scan_code')}
            className="group relative overflow-hidden bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-3xl p-8 transition-all hover:scale-[1.02] text-left"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-200 rounded-full blur-2xl opacity-50 transition-transform group-hover:scale-150" />
            <ScanLine className="w-12 h-12 text-amber-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-[Space_Grotesk]">Escanear Código</h3>
            <p className="text-slate-600 text-sm">Insira o código de um colega para ver a oferta dele.</p>
          </button>
        </div>
      )}

      {(view === 'select_duplicate' || view === 'select_counter') && (
        <div>
          <button onClick={() => setView('menu')} className="text-brand-600 font-medium mb-6 hover:underline flex items-center gap-1">
            &larr; Voltar
          </button>
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            {view === 'select_duplicate' ? 'Selecione a figurinha que deseja oferecer:' : 'Selecione qual repetida você dará em troca:'}
          </h3>
          
          {duplicates.length === 0 ? (
            <div className="text-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">Você não possui figurinhas repetidas no momento.</p>
              <p className="text-sm text-slate-400 mt-2">Continue completando quizzes e comprando pacotes!</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setRarityFilter('all')}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 ${rarityFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setRarityFilter('regular')}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 ${rarityFilter === 'regular' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  Regular
                </button>
                <button
                  onClick={() => setRarityFilter('holografica')}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 ${rarityFilter === 'holografica' ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-200'}`}
                >
                  Holográfica
                </button>
                <button
                  onClick={() => setRarityFilter('lendaria')}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 ${rarityFilter === 'lendaria' ? 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300' : 'bg-white text-slate-600 border-slate-200 hover:border-fuchsia-200'}`}
                >
                  Lendária
                </button>
                <button
                  onClick={() => setRarityFilter('suprema')}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 ${rarityFilter === 'suprema' ? 'bg-yellow-100 text-yellow-800 border-yellow-400' : 'bg-white text-slate-600 border-slate-200 hover:border-yellow-200'}`}
                >
                  Suprema
                </button>
              </div>

              {filteredDuplicates.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-slate-500">Nenhuma repetida encontrada para essa raridade.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {filteredDuplicates.map(id => (
                    <button
                      key={id}
                      onClick={() => view === 'select_duplicate' ? startTradeOffer(id) : sendCounterOffer(id)}
                      className="transition-transform hover:scale-105 active:scale-95 text-left"
                    >
                      {renderStickerCard(id)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === 'wait_partner' && activeTrade && (
        <div className="text-center py-10">
          <div className="max-w-xs mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-8 shadow-inner">
            <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Código da Troca</h4>
            <div className="text-6xl font-[Space_Grotesk] font-bold text-brand-600 tracking-widest">
              {activeTrade.id}
            </div>
            <p className="text-sm text-slate-400 mt-4">Expira em 5 minutos</p>
          </div>

          <div className="flex flex-col items-center justify-center mb-10">
            <p className="text-lg text-slate-700 font-medium mb-4">Sua oferta:</p>
            {renderStickerCard(activeTrade.initiator.stickerId)}
          </div>

          <p className="text-slate-500 font-medium animate-pulse mb-8 flex items-center justify-center gap-2">
            <RefreshCcw className="w-5 h-5 animate-spin" />
            Aguardando leitura do colega...
          </p>

          <button onClick={cancelTrade} className="text-red-500 font-bold hover:bg-red-50 px-6 py-3 rounded-xl transition-colors">
            Cancelar Troca
          </button>
        </div>
      )}

      {view === 'scan_code' && (
        <div className="max-w-md mx-auto py-8">
          <button onClick={() => setView('menu')} className="text-brand-600 font-medium mb-6 hover:underline flex items-center gap-1">
             &larr; Voltar
          </button>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-2 font-[Space_Grotesk] text-center">Inserir Código</h3>
          <p className="text-slate-500 mb-8 text-center">Digite o código de 4 dígitos gerado no celular do seu colega.</p>

          <form onSubmit={joinTrade} className="flex flex-col gap-6">
            <input
              type="text"
              maxLength={4}
              value={scanCode}
              onChange={e => setScanCode(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              className="text-center text-5xl font-[Space_Grotesk] font-bold tracking-[0.5em] p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-300"
            />
            
            <button
              type="submit"
              disabled={scanCode.length !== 4}
              className="w-full bg-brand-600 disabled:opacity-50 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95"
            >
              Buscar Troca
            </button>
          </form>
        </div>
      )}

      {view === 'negotiating' && activeTrade && activeTrade.receiver && (
        <div className="py-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 font-[Space_Grotesk] text-center">Revisão da Troca</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12">
            
            <div className="flex flex-col items-center">
              <span className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                {role === 'initiator' ? 'Você enviará' : `Colega (${activeTrade.initiator.userName}) envia`}
              </span>
              {renderStickerCard(activeTrade.initiator.stickerId)}
            </div>

            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-6 h-6 text-slate-400" />
            </div>

            <div className="flex flex-col items-center">
               <span className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                {role === 'receiver' ? 'Você enviará' : `Colega (${activeTrade.receiver.userName}) envia`}
              </span>
              {renderStickerCard(activeTrade.receiver.stickerId)}
            </div>

          </div>

          <div className="max-w-sm mx-auto flex flex-col gap-4">
            {((role === 'initiator' && activeTrade.initiator.confirmed) || (role === 'receiver' && activeTrade.receiver.confirmed)) ? (
              <div className="text-center p-4 bg-brand-50 text-brand-700 rounded-xl font-medium border border-brand-200">
                Aguardando a confirmação do colega...
              </div>
            ) : (
              <button
                onClick={confirmTrade}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 text-lg"
              >
                Confirmar Troca 🤝
              </button>
            )}
            
            <button
              onClick={cancelTrade}
              className="w-full bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 font-bold py-3 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {view === 'success' && (
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center py-12 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-green-50">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4 font-[Space_Grotesk]">Transferência Concluída!</h2>
          <p className="text-slate-500 mb-8 max-w-md">O Celso entrou para o seu elenco! A figurinha já foi adicionada ao seu álbum.</p>
          
          <button
            onClick={() => { setView('menu'); setActiveTrade(null); setRole('none'); }}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-10 rounded-xl transition-colors shadow-sm"
          >
            Voltar para Trocas
          </button>
        </motion.div>
      )}

    </div>
  );
}
