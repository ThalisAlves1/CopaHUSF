import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, ScanLine, ArrowRightLeft, CheckCircle2, XCircle, AlertCircle, RefreshCcw, ShoppingCart, Tag, Loader2, Wallet, PlusCircle, Ban, Store as StoreIcon, Coins } from 'lucide-react';
import { User } from '../types';
import { STICKER_CATALOG, StickerDefinition, getAllStickers, getStickerById, StickerRarity } from '../lib/store';
import { playSound } from '../lib/audio';
import confetti from 'canvas-confetti';
import { dbGetTrade, dbUpsertTrade, dbGetMarketListings, dbCreateMarketListing, dbBuyMarketListing, dbCancelMarketListing, dbFindUserByCpf, subscribeToMarket, StickerMarketListing } from '../lib/supabase';
import { appendActivityLog, createActivityEntry } from '../lib/activity';
import { StickerImage } from './StickerImage';

interface TradingProps {
  user: User;
  onTradeComplete: (givenStickerId: number, receivedStickerId: number) => void;
  onUserUpdate?: (updatedUser: User) => void;
  initialMode?: 'trocas' | 'mercado';
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


export function Trading({ user, onTradeComplete, onUserUpdate, initialMode = 'trocas' }: TradingProps) {
  const [view, setView] = useState<'menu' | 'select_duplicate' | 'wait_partner' | 'scan_code' | 'select_counter' | 'negotiating' | 'success'>('menu');
  const [role, setRole] = useState<'none' | 'initiator' | 'receiver'>('none');
  const [activeTrade, setActiveTrade] = useState<TradeSession | null>(null);
  const [scanCode, setScanCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [mode, setMode] = useState<'trocas' | 'mercado'>(initialMode);
  const [marketListings, setMarketListings] = useState<StickerMarketListing[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [marketSuccess, setMarketSuccess] = useState('');
  const [sellStickerId, setSellStickerId] = useState<number | null>(null);
  const [sellPrice, setSellPrice] = useState('40');
  const [showOnlyMissing, setShowOnlyMissing] = useState(true);
  const [processingListingId, setProcessingListingId] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

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


  const refreshMarketListings = async () => {
    setMarketLoading(true);
    try {
      const listings = await dbGetMarketListings('active', { force: true, limit: 100 });
      setMarketListings(listings);
      setMarketError('');
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : 'Não foi possível carregar o mercado de figurinhas.');
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async (force = false) => {
      setMarketLoading(true);
      try {
        const listings = await dbGetMarketListings('active', { force, limit: 100 });
        if (active) {
          setMarketListings(listings);
          setMarketError('');
        }
      } catch (err) {
        if (active) setMarketError(err instanceof Error ? err.message : 'Não foi possível carregar o mercado de figurinhas.');
      } finally {
        if (active) setMarketLoading(false);
      }
    };

    load(false);
    const subscription = subscribeToMarket(() => load(true));

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const applyFreshLoggedUser = async (entry: ReturnType<typeof createActivityEntry>) => {
    if (!onUserUpdate) return;
    const freshUser = await dbFindUserByCpf(user.cpf);
    if (!freshUser) return;
    onUserUpdate(appendActivityLog(freshUser, entry));
  };

  const handleCreateMarketListing = async () => {
    setMarketError('');
    setMarketSuccess('');

    if (!sellStickerId) {
      setMarketError('Selecione uma figurinha repetida para vender.');
      return;
    }

    const price = Number(sellPrice);
    if (!Number.isFinite(price) || price < 10 || price > 300) {
      setMarketError('Informe um preço entre 10 e 300 moedas.');
      return;
    }

    if ((stickerCounts[sellStickerId] || 0) <= 1) {
      setMarketError('Você só pode vender figurinhas repetidas. A última unidade fica protegida no seu álbum.');
      return;
    }

    setProcessingListingId('create');
    try {
      const created = await dbCreateMarketListing(user, sellStickerId, price);
      const sticker = getStickerById(sellStickerId);

      await applyFreshLoggedUser(createActivityEntry({
        type: 'sticker',
        title: 'Figurinha anunciada no mercado',
        description: `Colocou a figurinha #${sellStickerId}${sticker ? ` (${sticker.name})` : ''} à venda por ${price} moedas.`,
        stickerIds: [sellStickerId],
        coinsBefore: user.coins,
        coinsAfter: user.coins
      }));

      setSellStickerId(null);
      setSellPrice('40');
      setMarketSuccess(`Figurinha #${created.stickerId} anunciada por ${created.price} moedas.`);
      await refreshMarketListings();
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : 'Não foi possível anunciar a figurinha.');
    } finally {
      setProcessingListingId(null);
    }
  };

  const handleBuyMarketListing = async (listing: StickerMarketListing) => {
    setMarketError('');
    setMarketSuccess('');

    if (listing.sellerCpf === user.cpf) {
      setMarketError('Você não pode comprar uma figurinha anunciada por você.');
      return;
    }

    if (user.coins < listing.price) {
      setMarketError(`Você precisa de ${listing.price} moedas para comprar essa figurinha. Saldo atual: ${user.coins}.`);
      return;
    }

    setProcessingListingId(listing.id);
    try {
      const sold = await dbBuyMarketListing(listing.id, user);
      const sticker = getStickerById(sold.stickerId);
      const coinsAfter = user.coins - sold.price;

      await applyFreshLoggedUser(createActivityEntry({
        type: 'purchase',
        title: 'Figurinha comprada no mercado',
        description: `Comprou a figurinha #${sold.stickerId}${sticker ? ` (${sticker.name})` : ''} de ${sold.sellerName} por ${sold.price} moedas.`,
        points: -sold.price,
        stickerIds: [sold.stickerId],
        coinsBefore: user.coins,
        coinsAfter
      }));

      setMarketSuccess(`Compra concluída! A figurinha #${sold.stickerId} foi adicionada ao seu álbum.`);
      playSound('success');
      await refreshMarketListings();
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : 'Não foi possível comprar a figurinha.');
      playSound('error');
    } finally {
      setProcessingListingId(null);
    }
  };

  const handleCancelMarketListing = async (listing: StickerMarketListing) => {
    setMarketError('');
    setMarketSuccess('');
    setProcessingListingId(listing.id);

    try {
      const cancelled = await dbCancelMarketListing(listing.id, user.cpf);
      const sticker = getStickerById(cancelled.stickerId);

      await applyFreshLoggedUser(createActivityEntry({
        type: 'sticker',
        title: 'Venda de figurinha cancelada',
        description: `Cancelou o anúncio da figurinha #${cancelled.stickerId}${sticker ? ` (${sticker.name})` : ''}. A figurinha voltou para o álbum.`,
        stickerIds: [cancelled.stickerId],
        coinsBefore: user.coins,
        coinsAfter: user.coins
      }));

      setMarketSuccess('Anúncio cancelado e figurinha devolvida ao seu álbum.');
      await refreshMarketListings();
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : 'Não foi possível cancelar esse anúncio.');
    } finally {
      setProcessingListingId(null);
    }
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
          <StickerImage id={s.id} name={s.name} customImage={s.image} />
        </div>
        <span className="font-bold text-[9px] uppercase tracking-widest opacity-90 mt-2 mb-1">{s.rarity}</span>
        <h4 className="font-bold text-[10px] leading-tight font-[Space_Grotesk] line-clamp-3">{s.name}</h4>
      </div>
    );
  };

  const visibleMarketListings = marketListings
    .filter(listing => listing.status === 'active')
    .filter(listing => !showOnlyMissing || !user.stickers.includes(listing.stickerId));

  const ownMarketListings = marketListings.filter(listing => listing.status === 'active' && listing.sellerCpf === user.cpf);

  const renderMarket = () => (
    <div className="space-y-8">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 sm:p-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-amber-300/30 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-amber-200 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 mb-3">
              <StoreIcon className="w-3.5 h-3.5" /> Mercado da Copa
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-[Space_Grotesk] leading-tight">Venda repetidas e compre figurinhas que faltam</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Aqui a figurinha anunciada fica reservada. Se vender, o comprador recebe a figurinha e o vendedor recebe as moedas. Se cancelar, ela volta para o álbum.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[220px]">
            <div className="rounded-2xl bg-white/85 border border-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu saldo</p>
              <p className="text-2xl font-black text-amber-600 flex items-center gap-1"><Coins className="w-5 h-5" /> {user.coins}</p>
            </div>
            <div className="rounded-2xl bg-white/85 border border-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anúncios</p>
              <p className="text-2xl font-black text-emerald-600">{marketListings.filter(l => l.status === 'active').length}</p>
            </div>
          </div>
        </div>
      </div>

      {(marketError || marketSuccess) && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${marketError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {marketError ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-sm font-bold leading-relaxed">{marketError || marketSuccess}</p>
          <button onClick={() => { setMarketError(''); setMarketSuccess(''); }} className="ml-auto opacity-70 hover:opacity-100"><XCircle className="w-5 h-5" /></button>
        </div>
      )}

      <div className="grid xl:grid-cols-[380px,1fr] gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 font-[Space_Grotesk] leading-tight">Anunciar repetida</h4>
              <p className="text-xs text-slate-500">A última unidade fica protegida no álbum.</p>
            </div>
          </div>

          {duplicates.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <p className="font-bold text-slate-600 text-sm">Você ainda não tem repetidas para vender.</p>
              <p className="text-xs text-slate-400 mt-1">Compre pacotes ou complete metas para conseguir novas figurinhas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Escolha a repetida</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {duplicates.map(id => {
                    const sticker = getStickerById(id);
                    const selected = sellStickerId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSellStickerId(id)}
                        className={`rounded-2xl border p-2 text-left transition-all ${selected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 bg-white hover:border-emerald-200'}`}
                      >
                        <div className="aspect-[2.5/3.5] rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center mb-2">
                          {sticker && <StickerImage id={id} name={sticker.name} customImage={sticker.image} />}
                        </div>
                        <p className="text-[10px] font-black text-slate-800 leading-tight line-clamp-2">#{id} {sticker?.name || 'Figurinha'}</p>
                        <p className="text-[9px] font-bold text-amber-600 mt-1">{stickerCounts[id] - 1} vendável</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Preço em moedas</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={sellPrice}
                    onChange={e => setSellPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-black text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="40"
                  />
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-700 font-black flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Preço permitido: 10 a 300 moedas.</p>
              </div>

              <button
                onClick={handleCreateMarketListing}
                disabled={processingListingId === 'create'}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black py-4 shadow-lg shadow-emerald-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {processingListingId === 'create' ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                Anunciar no mercado
              </button>
            </div>
          )}

          {ownMarketListings.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h5 className="font-black text-slate-800 text-sm mb-3">Meus anúncios ativos</h5>
              <div className="space-y-2">
                {ownMarketListings.map(listing => {
                  const sticker = getStickerById(listing.stickerId);
                  return (
                    <div key={listing.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-3">
                      <div className="w-12 h-16 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                        {sticker && <StickerImage id={sticker.id} name={sticker.name} customImage={sticker.image} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800 truncate">#{listing.stickerId} {sticker?.name || 'Figurinha'}</p>
                        <p className="text-xs font-bold text-amber-600">{listing.price} moedas</p>
                      </div>
                      <button
                        onClick={() => handleCancelMarketListing(listing)}
                        disabled={processingListingId === listing.id}
                        className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 p-2 disabled:opacity-50"
                        title="Cancelar anúncio"
                      >
                        {processingListingId === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm min-h-[420px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h4 className="font-black text-slate-900 font-[Space_Grotesk] leading-tight">Figurinhas à venda</h4>
              <p className="text-xs text-slate-500">Compre usando suas moedas. A atualização acontece em tempo real.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyMissing(v => !v)}
                className={`rounded-full px-3 py-2 text-[11px] font-black border transition-colors ${showOnlyMissing ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
              >
                Só as que faltam
              </button>
              <button onClick={refreshMarketListings} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                {marketLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {marketLoading && marketListings.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-bold">Carregando mercado...</p>
            </div>
          ) : visibleMarketListings.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8">
              <ShoppingCart className="w-10 h-10 text-slate-300 mb-3" />
              <p className="font-black text-slate-700">Nenhuma figurinha disponível agora.</p>
              <p className="text-sm text-slate-400 mt-1">Quando alguém anunciar uma repetida, ela aparecerá aqui.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleMarketListings.map(listing => {
                const sticker = getStickerById(listing.stickerId);
                const isOwn = listing.sellerCpf === user.cpf;
                const alreadyHas = user.stickers.includes(listing.stickerId);
                return (
                  <div key={listing.id} className={`rounded-3xl border p-4 transition-all ${isOwn ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'}`}>
                    <div className="aspect-[2.5/3.5] max-h-52 mx-auto rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center mb-4">
                      {sticker && <StickerImage id={sticker.id} name={sticker.name} customImage={sticker.image} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-black text-slate-900 leading-tight text-sm line-clamp-2">#{listing.stickerId} {sticker?.name || 'Figurinha'}</h5>
                        {alreadyHas && !isOwn && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500">Você tem</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">Vendedor: <strong>{isOwn ? 'você' : listing.sellerName}</strong></p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-700 font-black flex items-center gap-1">
                          <Coins className="w-4 h-4" /> {listing.price}
                        </div>
                        {isOwn ? (
                          <button
                            onClick={() => handleCancelMarketListing(listing)}
                            disabled={processingListingId === listing.id}
                            className="rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-black px-4 py-2 text-xs disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyMarketListing(listing)}
                            disabled={processingListingId === listing.id || user.coins < listing.price}
                            className="rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black px-4 py-2 text-xs flex items-center gap-2"
                          >
                            {processingListingId === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                            Comprar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

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

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        <button
          onClick={() => setMode('trocas')}
          className={`rounded-xl px-3 py-3 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'trocas' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Troca por código
        </button>
        <button
          onClick={() => setMode('mercado')}
          className={`rounded-xl px-3 py-3 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'mercado' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Mercado
        </button>
      </div>

      {errorMsg && mode === 'trocas' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} className="ml-auto text-red-500 hover:text-red-700"><XCircle className="w-5 h-5" /></button>
        </div>
      )}

      {mode === 'mercado' ? renderMarket() : (
        <>
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
              className="text-center text-4xl sm:text-5xl font-[Space_Grotesk] font-bold tracking-[0.22em] sm:tracking-[0.5em] px-4 py-5 sm:p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-300"
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
        </>
      )}

    </div>
  );
}
