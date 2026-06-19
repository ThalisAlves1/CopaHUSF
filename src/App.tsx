import React, { useState, useEffect, useRef } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User, MetaProgress } from './types';
import { openPackage } from './lib/store';
import { appendActivityLog, createActivityEntry } from './lib/activity';
import { getStoredUsers, simulateLogin } from './lib/auth';
import { LogOut, RefreshCw } from 'lucide-react';
import { dbSaveSingleUser } from './lib/supabase';


const normalizeLoggedUser = (rawUser: User): User => {
  const cleanName = String(rawUser?.name || '').replace(/\s+/g, ' ').trim();
  const cleanSector = String(rawUser?.sector || '').replace(/\s+/g, ' ').trim();
  const numericCoins = Number(rawUser?.coins ?? 0);

  return {
    ...rawUser,
    cpf: String(rawUser?.cpf || ''),
    name: cleanName || 'Colaborador',
    sector: cleanSector || 'Outro Setor',
    coins: Number.isFinite(numericCoins) ? numericCoins : 0,
    stickers: Array.isArray(rawUser?.stickers) ? rawUser.stickers : [],
    progress: rawUser?.progress && typeof rawUser.progress === 'object' ? rawUser.progress : {},
    activityLog: Array.isArray(rawUser?.activityLog) ? rawUser.activityLog : rawUser?.activityLog,
    isAdmin: !!rawUser?.isAdmin,
  };
};

const AppLoadingScreen = ({ title = 'Copa das Metas', message = 'Carregando...' }: { title?: string; message?: string }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
    <div className="relative flex flex-col items-center">
      <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-brand-600 animate-spin mb-6 shadow-inner tracking-widest text-[#14b8a6]"></div>
      <div className="space-y-1 animate-pulse">
        <h3 className="font-extrabold text-slate-800 text-lg tracking-tight font-[Space_Grotesk]">
          {title}
        </h3>
        <p className="text-[12px] font-semibold text-slate-400">
          {message}
        </p>
      </div>
    </div>
  </div>
);

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  resetKey: string;
  onLogout?: () => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends (React as any).Component {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error || 'Erro inesperado');
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Erro capturado na tela principal da Copa HUSF:', error, info);
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    const props = (this as any).props as AppErrorBoundaryProps;
    const state = (this as any).state as AppErrorBoundaryState;

    if (prevProps.resetKey !== props.resetKey && state.hasError) {
      (this as any).setState({ hasError: false, errorMessage: '' });
    }
  }

  render() {
    const props = (this as any).props as AppErrorBoundaryProps;
    const state = (this as any).state as AppErrorBoundaryState;

    if (!state.hasError) return props.children;

    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
        <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-300/30 text-amber-200">
            <RefreshCw className="h-8 w-8" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-200/80">Recuperação automática</p>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">A tela demorou para abrir</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            O app encontrou uma falha temporária ao abrir o painel. Toque em tentar novamente para carregar sem precisar ficar olhando uma tela branca.
          </p>
          {state.errorMessage && (
            <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-left text-[11px] font-semibold text-slate-400 break-words">
              Detalhe técnico: {state.errorMessage}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => (this as any).setState({ hasError: false, errorMessage: '' })}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar abrir novamente
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-white/10"
            >
              Atualizar app
            </button>
            {props.onLogout && (
              <button
                type="button"
                onClick={props.onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sair e voltar ao login
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false);
  const loginTransitionTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (loginTransitionTimer.current !== null) {
        window.clearTimeout(loginTransitionTimer.current);
      }
    };
  }, []);

  const saveUserLocallyOnly = (updatedUser: User) => {
    const safeUpdatedUser = normalizeLoggedUser(updatedUser);

    try {
      const users = getStoredUsers() || [];
      const cleanUserCpf = safeUpdatedUser.cpf.replace(/\D/g, '');
      const updatedUsers = users.map(u => {
        if (!u || !u.cpf || typeof u.cpf !== 'string') return u;
        return u.cpf.replace(/\D/g, '') === cleanUserCpf ? { ...safeUpdatedUser, cpf: u.cpf } : u;
      });
      const hasUser = updatedUsers.some(u => u && u.cpf && typeof u.cpf === 'string' && u.cpf.replace(/\D/g, '') === cleanUserCpf);
      if (!hasUser) updatedUsers.push(safeUpdatedUser);
      localStorage.setItem('husf_users', JSON.stringify(updatedUsers));
    } catch (err) {
      console.warn('Não foi possível salvar cache local do usuário:', err);
    }
  };

  const persistLoggedUser = (nextUser: User) => {
    const safeNextUser = normalizeLoggedUser(nextUser);
    const versionedUser: User = {
      ...safeNextUser,
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
      try {
        const storedCpf = localStorage.getItem('husf_session_cpf');
        if (storedCpf) {
          const loggedUser = await simulateLogin(storedCpf);
          if (loggedUser) {
            setUser(normalizeLoggedUser(loggedUser));
          } else {
            localStorage.removeItem('husf_session_cpf');
          }
        }
      } catch (err) {
        console.error("Erro ao recuperar sessão:", err);
      } finally {
        setLoadingSession(false);
      }
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
    const safeUser = normalizeLoggedUser(userData);
    localStorage.setItem('husf_session_cpf', safeUser.cpf);
    saveUserLocallyOnly(safeUser);

    // Evita a sensação de tela branca em celulares lentos: primeiro mostra uma tela
    // de preparação, depois monta o Dashboard já com os dados normalizados.
    setIsOpeningDashboard(true);
    if (loginTransitionTimer.current !== null) {
      window.clearTimeout(loginTransitionTimer.current);
    }
    loginTransitionTimer.current = window.setTimeout(() => {
      setUser(safeUser);
      setIsOpeningDashboard(false);
      loginTransitionTimer.current = null;
    }, 150);
  };

  const handleLogout = () => {
    if (loginTransitionTimer.current !== null) {
      window.clearTimeout(loginTransitionTimer.current);
      loginTransitionTimer.current = null;
    }
    setIsOpeningDashboard(false);
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
    return <AppLoadingScreen message="Carregando sessão de login..." />;
  }

  if (isOpeningDashboard) {
    return <AppLoadingScreen title="Copa HUSF" message="Preparando painel do colaborador..." />;
  }

  return (
    <AppErrorBoundary resetKey={user ? normalizeLoggedUser(user).cpf : 'login'} onLogout={user ? handleLogout : undefined}>
      <React.Suspense fallback={<AppLoadingScreen title="Copa HUSF" message="Carregando módulos do app..." />}>
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
      <footer className="fixed bottom-1 left-0 right-0 z-[80] px-3 text-center text-[9px] font-medium text-white/35">
  Criado pela Diretoria de Ensino e Pesquisa / NSP-Qualidade
</footer>
        </>
      </React.Suspense>
    </AppErrorBoundary>
  );
}

