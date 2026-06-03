import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User, MetaProgress } from './types';
import { openPackage } from './lib/store';
import { appendActivityLog, createActivityEntry } from './lib/activity';
import { getStoredUsers, simulateLogin } from './lib/auth';
import { RefreshCw } from 'lucide-react';
import { dbSaveSingleUser } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const saveUserLocallyOnly = (updatedUser: User) => {
    try {
      const users = getStoredUsers() || [];
      const cleanUserCpf = updatedUser.cpf.replace(/\D/g, '');
      const updatedUsers = users.map(u => {
        if (!u || !u.cpf || typeof u.cpf !== 'string') return u;
        return u.cpf.replace(/\D/g, '') === cleanUserCpf ? { ...updatedUser, cpf: u.cpf } : u;
      });
      const hasUser = updatedUsers.some(u => u && u.cpf && typeof u.cpf === 'string' && u.cpf.replace(/\D/g, '') === cleanUserCpf);
      if (!hasUser) updatedUsers.push(updatedUser);
      localStorage.setItem('husf_users', JSON.stringify(updatedUsers));
    } catch (err) {
      console.warn('Não foi possível salvar cache local do usuário:', err);
    }
  };

  const persistLoggedUser = (nextUser: User) => {
    const versionedUser: User = {
      ...nextUser,
      updatedAt: new Date().toISOString()
    };

    setUser(versionedUser);
    saveUserLocallyOnly(versionedUser);

    void dbSaveSingleUser(versionedUser).catch((err) => {
      console.error('Erro ao salvar progresso do usuário no Supabase:', err);
    });

    return versionedUser;
  };

  // Pull to Refresh state
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load session from localStorage on startup
  useEffect(() => {
    async function initSession() {
      const storedCpf = localStorage.getItem('husf_session_cpf');
      if (storedCpf) {
        try {
          const loggedUser = await simulateLogin(storedCpf);
          if (loggedUser) {
            setUser(loggedUser);
          } else {
            localStorage.removeItem('husf_session_cpf');
          }
        } catch (err) {
          console.error("Erro ao recuperar sessão:", err);
        }
      }
      setLoadingSession(false);
    }
    initSession();
  }, []);

  // Update only the local cache when the logged user changes.
  // Cloud sync is made with dbSaveSingleUser at the exact action moment
  // so old local caches do not overwrite other collaborators.
  useEffect(() => {
    if (user && user.cpf) {
      saveUserLocallyOnly(user);
    }
  }, [user]);

  // Handle Touch Pull-to-refresh
  useEffect(() => {
    let startY = 0;
    let active = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only drag down if we are at the top of the viewport
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        active = true;
      } else {
        active = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!active || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0) {
        setIsPulling(true);
        const distance = Math.min(120, diff * 0.45);
        setPullY(distance);
        
        // Prevent default bounce and nested refresh gestures
        if (distance > 10 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!active || isRefreshing) return;
      active = false;
      setIsPulling(false);

      if (pullY >= 75) {
        setIsRefreshing(true);
        setPullY(75); // Stay visible briefly
        
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }

        // Trigger safe page reload to pull freshest data
        setTimeout(() => {
          window.location.reload();
        }, 1100);
      } else {
        setPullY(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullY, isRefreshing]);

  const handleLoginSuccess = (userData: User) => {
    localStorage.setItem('husf_session_cpf', userData.cpf);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('husf_session_cpf');
    setUser(null);
  };

  const handleBuyPack = (packageId: string, cost: number) => {
    if (user && user.coins >= cost) {
      const stickers = openPackage(packageId);
      const newStickerIds = stickers.map(s => s.id);
      const coinsAfter = user.coins - cost;

      const updatedUser = appendActivityLog({
        ...user,
        coins: coinsAfter,
        stickers: [...user.stickers, ...newStickerIds],
      }, createActivityEntry({
        type: 'purchase',
        title: 'Pacote de figurinhas comprado',
        description: `Comprou um pacote na loja e recebeu ${newStickerIds.length} figurinha${newStickerIds.length === 1 ? '' : 's'}: ${newStickerIds.map(id => `#${id}`).join(', ')}.`,
        points: -cost,
        stickerIds: newStickerIds,
        coinsBefore: user.coins,
        coinsAfter
      }));

      persistLoggedUser(updatedUser);
      return stickers;
    }
    return [];
  };

  const handleQuizFinish = (metaId: number, coinsEarned: number, correctAnswers: number, newProgress: MetaProgress) => {
    if (!user) return;

    const coinsAfter = user.coins + coinsEarned;
    const baseUpdatedUser: User = {
      ...user,
      coins: coinsAfter,
      progress: {
        ...user.progress,
        [metaId]: newProgress
      }
    };

    const updatedUser = appendActivityLog(baseUpdatedUser, createActivityEntry({
      type: 'quiz',
      title: coinsEarned > 0 ? `Meta ${metaId} pontuada` : `Meta ${metaId} respondida`,
      description: `Acertou ${correctAnswers}/5 perguntas${coinsEarned > 0 ? ` e ganhou ${coinsEarned} moedas` : ' sem receber novas moedas nesta tentativa'}.`,
      points: coinsEarned,
      metaId,
      coinsBefore: user.coins,
      coinsAfter
    }));

    persistLoggedUser(updatedUser);
  };

  const handleTradeComplete = (givenStickerId: number, receivedStickerId: number) => {
    if (!user) return;
    const newStickers = [...user.stickers];
    const indexToRemove = newStickers.indexOf(givenStickerId);
    if (indexToRemove !== -1) {
      newStickers.splice(indexToRemove, 1);
    }
    newStickers.push(receivedStickerId);

    const updatedUser = appendActivityLog({ ...user, stickers: newStickers }, createActivityEntry({
      type: 'trade',
      title: 'Troca de figurinha concluída',
      description: `Enviou a figurinha #${givenStickerId} e recebeu a figurinha #${receivedStickerId}.`,
      stickerIds: [givenStickerId, receivedStickerId],
      coinsBefore: user.coins,
      coinsAfter: user.coins
    }));

    persistLoggedUser(updatedUser);
  };

  const handleUpdateUser = (updatedUser: User) => {
    persistLoggedUser(updatedUser);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-brand-600 animate-spin mb-6 shadow-inner tracking-widest text-[#14b8a6]"></div>
          <div className="space-y-1 animate-pulse">
            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight font-[Space_Grotesk]">
              Copa das Metas
            </h3>
            <p className="text-[12px] font-semibold text-slate-400">
              Carregando sessão de login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Pull to Refresh Indicator */}
      {(pullY > 0 || isRefreshing) && (
        <div 
          className="fixed left-0 right-0 top-0 z-[9999] flex justify-center pointer-events-none"
          style={{
            transform: `translateY(${pullY - 60}px)`,
            opacity: Math.min(1, pullY / 40),
            transition: isPulling ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s'
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur border border-slate-800 text-white rounded-full px-5 py-2.5 shadow-xl flex items-center gap-3.5 mt-4 transition-all">
            <RefreshCw 
              className={`w-3.5 h-3.5 text-brand-500 hover:text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} 
              style={{
                transform: isRefreshing ? 'none' : `rotate(${pullY * 4}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.05s linear'
              }}
            />
            <span className="text-[11px] font-bold tracking-wide font-sans text-slate-200">
              {isRefreshing 
                ? 'Atualizando dados...' 
                : pullY >= 75 
                  ? 'Solte para atualizar' 
                  : 'Puxe para atualizar'
              }
            </span>
          </div>
        </div>
      )}

      {user ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onBuyPack={handleBuyPack} 
          onQuizFinish={handleQuizFinish} 
          onTradeComplete={handleTradeComplete} 
          onUpdateUser={handleUpdateUser}
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}
