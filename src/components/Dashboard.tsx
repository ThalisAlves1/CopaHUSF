import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, LogOut, CheckCircle2, Building2, PlayCircle, Trophy, ShoppingBag, Coins, LayoutGrid, UserCheck, MessageSquare, Pill, Stethoscope, Droplets, ShieldAlert, ArrowLeft, BookOpen, Crown, User as UserIcon, AlertCircle, Zap, ArrowRightLeft, Search, ShieldCheck, Award, UserPlus, Trash2, Lock, Unlock, Upload, Image, Database, Wifi, WifiOff, Edit, X, RefreshCw, Hourglass } from 'lucide-react';
import { User, MetaProgress } from '../types';
const Store = lazy(() => import('./Store').then(module => ({ default: module.Store })));
const Quiz = lazy(() => import('./Quiz').then(module => ({ default: module.Quiz })));
const Trading = lazy(() => import('./Trading').then(module => ({ default: module.Trading })));
const WelcomeScreen = lazy(() => import('./WelcomeScreen').then(module => ({ default: module.WelcomeScreen })));
const StudyMaterial = lazy(() => import('./StudyMaterial').then(module => ({ default: module.StudyMaterial })));
import { getStoredUsers, formatCPF } from '../lib/auth';
import { StickerDefinition, getStickerById, getAllStickers, getStoredStickers, saveStoredStickers } from '../lib/store';
import { dbGetUsers, dbGetStickers, dbSaveSingleUser, dbDeleteUser, dbInsertSticker, dbUpdateSticker, dbDeleteSticker, dbSaveWholeCatalog, dbGetReleasedMetas, dbSaveReleasedMetas, dbGetPendingUserSyncCount, dbEnterVirtualQueue, dbLeaveVirtualQueue, getVirtualQueueSessionId, VIRTUAL_QUEUE_MAX_ACTIVE_USERS, VIRTUAL_QUEUE_REFRESH_MS, type VirtualQueueStatus, subscribeToUsers, subscribeToStickers, subscribeToSettings, DB_DEFAULT_STICKERS, isSupabaseConfigured, lastSupabaseError, uploadStickerImageFile, mapSupabaseUserRow, normalizeCpf } from '../lib/supabase';
import { StickerImage } from './StickerImage';
import { appendActivityLog, createActivityEntry, formatActivityTime, getActivityBadgeClass, getActivityLog, getActivityTypeLabel } from '../lib/activity';



const METAS = [
// ... keep METAS the same ...
  { id: 1, title: 'Meta 1', desc: 'Identificar o paciente corretamente', fullDesc: 'O objetivo desta meta é garantir que o paciente correto receba o tratamento correto. Isso envolve a utilização de no mínimo dois identificadores para confirmação, como o nome completo e a data de nascimento, antes de qualquer intervenção, administração de medicamentos ou procedimentos.', icon: <UserCheck className="w-6 h-6" />, color: 'bg-blue-500' },
  { id: 2, title: 'Meta 2', desc: 'Melhorar a comunicação efetiva', fullDesc: 'Garantir que as informações sejam transmitidas de forma clara, precisa e oportuna entre todos os profissionais de saúde. Uma comunicação efetiva reduz a ocorrência de erros, especialmente durante as transições de cuidado e ao receber ordens verbais ou telefônicas.', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-indigo-500' },
  { id: 3, title: 'Meta 3', desc: 'Segurança dos medicamentos', fullDesc: 'Melhorar a segurança no processo de prescrição, uso e administração de medicamentos. Há uma atenção redobrada aos medicamentos de alta vigilância, cujos erros podem causar danos graves, exigindo dupla checagem e rotulagem rigorosa.', icon: <Pill className="w-6 h-6" />, color: 'bg-rose-500' },
  { id: 4, title: 'Meta 4', desc: 'Assegurar cirurgia segura', fullDesc: 'Garantir que a cirurgia seja realizada no local correto, com o procedimento correto e no paciente correto. A aplicação do Checklist de Cirurgia Segura em suas três fases (antes da indução anestésica, antes da incisão cirúrgica e antes de o paciente sair da sala) é fundamental.', icon: <Stethoscope className="w-6 h-6" />, color: 'bg-amber-500' },
  { id: 5, title: 'Meta 5', desc: 'Reduzir o risco de infecções', fullDesc: 'Reduzir de forma substancial o risco de infecções associadas aos cuidados de saúde. A prática mais importante nesta meta é a correta e frequente higienização das mãos, seguindo os 5 momentos preconizados pela OMS.', icon: <Droplets className="w-6 h-6" />, color: 'bg-cyan-500' },
  { id: 6, title: 'Meta 6', desc: 'Reduzir o risco de quedas', fullDesc: 'Avaliar sistematicamente e mitigar os riscos de danos aos pacientes resultantes de quedas durante sua permanência na instituição. Isso abrange adequar o ambiente, utilizar pulseiras de identificação de risco e educar familiares e pacientes.', icon: <ShieldAlert className="w-6 h-6" />, color: 'bg-orange-500' },
];

const RANKING_META_IDS = METAS.map(meta => meta.id).sort((a, b) => a - b);

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onBuyPack: (packageId: string, cost: number) => StickerDefinition[];
  onQuizFinish: (metaId: number, coinsEarned: number, correctCount: number, newProgress: MetaProgress) => void;
  onTradeComplete: (givenStickerId: number, receivedStickerId: number) => void;
  onUpdateUser?: (updatedUser: User) => void;
}

type TabContent = 'inicio' | 'desafios' | 'album' | 'loja' | 'perfil' | 'ranking' | 'trocas' | 'admin' | 'estudo';
type AdminSection = 'overview' | 'colaboradores' | 'metas' | 'figurinhas' | 'monitoramento';

interface DashboardHistoryState {
  husfDashboardRoute: true;
  activeTab: TabContent;
  selectedMeta: number | null;
  studyMetaId: number | null;
  isQuizActive: boolean;
  adminSection: AdminSection;
}

const TAB_VALUES: TabContent[] = ['inicio', 'desafios', 'album', 'loja', 'perfil', 'ranking', 'trocas', 'admin', 'estudo'];
const ADMIN_SECTION_VALUES: AdminSection[] = ['overview', 'colaboradores', 'metas', 'figurinhas', 'monitoramento'];
const MARKET_NEWS_STORAGE_PREFIX = 'husf_market_news_v2_metas_prorrogadas_seen';
const MAX_STICKER_UPLOAD_BYTES = 1 * 1024 * 1024;
const MAX_STICKER_SOURCE_BYTES = 8 * 1024 * 1024;
const STICKER_IMAGE_MAX_DIMENSION = 700;
const STICKER_IMAGE_QUALITY = 0.75;
const RANKING_DISPLAY_LIMIT = 100;
const ADMIN_USERS_FETCH_LIMIT = 2000; // Base completa só quando necessário no admin/monitoramento. Suporta os 1.238 colaboradores.
const RANKING_SPEED_LIMIT_MS = 20_000;
const RANKING_SPEED_NEUTRAL_SCORE = 50;

const clampNumber = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const roundOneDecimal = (value: number) => Math.round(value * 10) / 10;
const formatAverageSeconds = (milliseconds?: number | null) => {
  if (!milliseconds || !Number.isFinite(milliseconds) || milliseconds <= 0) return '--';
  return `${roundOneDecimal(milliseconds / 1000)}s`;
};

const formatDurationSeconds = (milliseconds?: number | null) => {
  if (!milliseconds || !Number.isFinite(milliseconds) || milliseconds <= 0) return '--';
  return `${roundOneDecimal(milliseconds / 1000)}s`;
};

const normalizeTextKey = (value: string | null | undefined) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const normalizeSectorKey = (sector: string | null | undefined) => normalizeTextKey(sector);

const getMonitoringSectorLabel = (user: User) => String(user.sector || 'Outro Setor').replace(/\s+/g, ' ').trim() || 'Outro Setor';

const getMonitoringProgressScore = (user: User) => {
  const progressValues = Object.values(user.progress || {});
  const quizScore = progressValues.reduce((sum, progress) => sum + (progress?.totalCoinsEarned || 0), 0);
  const attemptsScore = progressValues.reduce((sum, progress) => sum + (progress?.totalAttempts || progress?.attemptsToday || 0), 0);
  const updatedScore = user.updatedAt ? Date.parse(user.updatedAt) || 0 : 0;
  return quizScore * 1000000 + attemptsScore * 1000 + updatedScore;
};

const chooseBestMonitoringUser = (current: User, candidate: User) => {
  const currentScore = getMonitoringProgressScore(current);
  const candidateScore = getMonitoringProgressScore(candidate);
  if (candidateScore > currentScore) return candidate;
  if (candidateScore < currentScore) return current;

  const currentSector = getMonitoringSectorLabel(current);
  const candidateSector = getMonitoringSectorLabel(candidate);
  return candidateSector.localeCompare(currentSector) < 0 ? candidate : current;
};

const getUniqueMonitoringCollaborators = (users: User[]) => {
  const byCpf = new Map<string, User>();
  const withoutCpf: User[] = [];

  users
    .filter(u => !u.isAdmin)
    .forEach((user) => {
      const cleanedUser = { ...user, sector: getMonitoringSectorLabel(user) };
      const cpfKey = normalizeCpf(cleanedUser.cpf);

      if (!cpfKey) {
        withoutCpf.push(cleanedUser);
        return;
      }

      const existing = byCpf.get(cpfKey);
      byCpf.set(cpfKey, existing ? chooseBestMonitoringUser(existing, cleanedUser) : cleanedUser);
    });

  const byName = new Map<string, User>();
  [...byCpf.values(), ...withoutCpf].forEach((user) => {
    const nameKey = normalizeTextKey(user.name);
    const fallbackKey = normalizeCpf(user.cpf) || `${nameKey}|${normalizeSectorKey(user.sector)}`;
    const key = nameKey || fallbackKey;
    const existing = byName.get(key);
    byName.set(key, existing ? chooseBestMonitoringUser(existing, user) : user);
  });

  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const getRankingUserKey = (user: User) => {
  const cpfKey = normalizeCpf(user.cpf);
  if (cpfKey) return `cpf:${cpfKey}`;

  const nameKey = normalizeTextKey(user.name);
  const sectorKey = normalizeSectorKey(user.sector);
  return `sem-cpf:${nameKey}|${sectorKey}`;
};

const getUniqueRankingCollaborators = (users: User[]) => {
  const unique = new Map<string, User>();

  users
    .filter(u => !u.isAdmin)
    .forEach((candidate) => {
      const cleanedCandidate = { ...candidate, sector: getMonitoringSectorLabel(candidate) };
      const key = getRankingUserKey(cleanedCandidate);
      const current = unique.get(key);
      unique.set(key, current ? chooseBestMonitoringUser(current, cleanedCandidate) : cleanedCandidate);
    });

  return Array.from(unique.values());
};

const LazyPanelFallback = () => (
  <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center text-slate-500 font-bold">
    Carregando módulo...
  </div>
);


const AppClosedScreen = ({ user, onLogout, releasedMetasReady }: { user: User; onLogout: () => void; releasedMetasReady: boolean }) => (
  <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_35%)]" />
    <section className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-300/30 text-amber-200">
        <Lock className="h-8 w-8" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-200/80">Modo econômico ativo</p>
      <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">Copa pausada no momento</h1>
      <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
        Nenhuma meta está liberada agora. Para proteger o Supabase e evitar travamentos, o app não está carregando ranking, loja, figurinhas, trocas nem listas grandes de colaboradores.
      </p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm text-slate-300">
        <p><strong className="text-white">Colaborador:</strong> {user.name}</p>
        <p><strong className="text-white">Setor:</strong> {user.sector}</p>
        <p className="mt-3 text-xs text-slate-400">
          {releasedMetasReady
            ? 'Assim que a coordenação liberar uma meta, o acesso volta automaticamente ao atualizar a página.'
            : 'Verificando liberação de metas...'}
        </p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </section>
  </main>
);


const VirtualQueueScreen = ({
  user,
  status,
  queueReady,
  onRefresh,
  onLogout
}: {
  user: User;
  status: VirtualQueueStatus | null;
  queueReady: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}) => {
  const peopleAhead = status?.peopleAhead || 0;
  const maxActive = status?.maxActive || VIRTUAL_QUEUE_MAX_ACTIVE_USERS;
  const waitMinutes = Math.max(1, Math.ceil((peopleAhead + 1) / Math.max(1, maxActive)) * 2);
  const waitLabel = waitMinutes === 1 ? 'até 1 minuto' : `até ${waitMinutes} minutos`;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_34%)]" />
      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-400/15 border border-brand-300/30 text-brand-200">
          <Hourglass className="h-8 w-8 animate-pulse" />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-200/80">Fila virtual</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">
          Você está na fila
        </h1>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tempo estimado de espera</p>
          <p className="mt-2 text-3xl font-black text-white">
            {queueReady ? waitLabel : 'Calculando...'}
          </p>
        </div>

        <p className="mt-5 text-sm text-slate-300">
          Quando chegar sua vez, o app abrirá automaticamente.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar tempo
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </section>
    </main>
  );
};

function isTabContent(value: string | null): value is TabContent {
  return !!value && TAB_VALUES.includes(value as TabContent);
}

function isAdminSection(value: string | null): value is AdminSection {
  return !!value && ADMIN_SECTION_VALUES.includes(value as AdminSection);
}

function buildDashboardHash(route: DashboardHistoryState) {
  const params = new URLSearchParams();
  params.set('tab', route.activeTab);
  if (route.selectedMeta !== null) params.set('meta', String(route.selectedMeta));
  if (route.studyMetaId !== null) params.set('study', String(route.studyMetaId));
  if (route.isQuizActive) params.set('quiz', '1');
  if (route.activeTab === 'admin') params.set('admin', route.adminSection);
  return `#${params.toString()}`;
}

function parseDashboardHash(): DashboardHistoryState | null {
  if (typeof window === 'undefined' || !window.location.hash) return null;

  const rawHash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(rawHash);
  const tab = params.get('tab');
  if (!isTabContent(tab)) return null;

  const meta = Number(params.get('meta'));
  const study = Number(params.get('study'));
  const admin = params.get('admin');

  return {
    husfDashboardRoute: true,
    activeTab: tab,
    selectedMeta: Number.isFinite(meta) && meta > 0 ? meta : null,
    studyMetaId: Number.isFinite(study) && study > 0 ? study : null,
    isQuizActive: params.get('quiz') === '1',
    adminSection: isAdminSection(admin) ? admin : 'overview',
  };
}

function isDashboardHistoryState(state: unknown): state is DashboardHistoryState {
  return !!state && typeof state === 'object' && (state as DashboardHistoryState).husfDashboardRoute === true;
}

function isMetaCompleted(progress?: MetaProgress | null) {
  if (!progress) return false;
  return !!progress.hasPerfected
    || (progress.totalCoinsEarned || 0) >= 150
    || (progress.totalAttempts || 0) >= 3
    || (progress.attemptsToday || 0) >= 3;
}

function getMetaAttemptCount(progress?: MetaProgress | null) {
  if (!progress) return 0;
  return Math.max(progress.totalAttempts || 0, progress.attemptsToday || 0);
}

function hasMetaQuizActivity(progress?: MetaProgress | null) {
  if (!progress) return false;
  return !!progress.hasPerfected
    || (progress.totalCoinsEarned || 0) > 0
    || (progress.totalAttempts || 0) > 0
    || (progress.attemptsToday || 0) > 0
    || !!progress.lastPlayedDate;
}

function sameUserData(a?: User | null, b?: User | null) {
  if (!a || !b) return false;
  return JSON.stringify({
    cpf: a.cpf,
    name: a.name,
    sector: a.sector,
    coins: a.coins,
    stickers: a.stickers || [],
    progress: a.progress || {},
    activityLog: getActivityLog(a),
    isAdmin: !!a.isAdmin
  }) === JSON.stringify({
    cpf: b.cpf,
    name: b.name,
    sector: b.sector,
    coins: b.coins,
    stickers: b.stickers || [],
    progress: b.progress || {},
    activityLog: getActivityLog(b),
    isAdmin: !!b.isAdmin
  });
}

function getUserTimestamp(user?: User | null): number {
  if (!user?.updatedAt) return 0;
  const value = Date.parse(user.updatedAt);
  return Number.isFinite(value) ? value : 0;
}

function shouldApplyRemoteUser(currentUser: User, remoteUser: User) {
  const currentTime = getUserTimestamp(currentUser);
  const remoteTime = getUserTimestamp(remoteUser);

  // Evita o bug de comprar figurinha/moedas mudarem na tela e depois voltarem.
  // Isso acontecia quando o realtime trazia uma versão antiga do Supabase antes
  // da compra terminar de sincronizar.
  if (currentTime && remoteTime && remoteTime + 1000 < currentTime) {
    return false;
  }

  return !sameUserData(currentUser, remoteUser);
}

export function Dashboard({ user, onLogout, onBuyPack, onQuizFinish, onTradeComplete, onUpdateUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabContent>('inicio');
  const [rankingTab, setRankingTab] = useState<'individual' | 'setores'>('individual');
  const [sectorRankingMetric, setSectorRankingMetric] = useState<'average' | 'total'>('average');
  const [selectedMeta, setSelectedMeta] = useState<number | null>(null);
  const [studyMetaId, setStudyMetaId] = useState<number | null>(null);
  const [zoomedSticker, setZoomedSticker] = useState<StickerDefinition | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminRefresh, setAdminRefresh] = useState(0);
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [adminViewedUserCpf, setAdminViewedUserCpf] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{coins: number, correct: number} | null>(null);
  const [showMarketNewsModal, setShowMarketNewsModal] = useState(false);
  const [tradingInitialMode, setTradingInitialMode] = useState<'trocas' | 'mercado'>('trocas');

  // Dynamic user list and registration states
  const [usersList, setUsersList] = useState<User[]>(() => getStoredUsers());

  const getAdminUsersSnapshot = async (): Promise<User[]> => {
    if (usersList.length > 0) {
      return JSON.parse(JSON.stringify(usersList));
    }
    return dbGetUsers({ maxRows: ADMIN_USERS_FETCH_LIMIT });
  };
  const [newRegCpf, setNewRegCpf] = useState('');
  const [newRegName, setNewRegName] = useState('');
  const [newRegSector, setNewRegSector] = useState('UTI Adulto');
  const [newRegError, setNewRegError] = useState('');
  const [newRegSuccess, setNewRegSuccess] = useState('');
  const [adminSearchFilter, setAdminSearchFilter] = useState('');
  const [adminQuizSectorFilter, setAdminQuizSectorFilter] = useState('all');
  const [adminQuizPage, setAdminQuizPage] = useState(0);
  const ADMIN_MONITORING_PAGE_SIZE = 100;
  const [confirmDeleteCpf, setConfirmDeleteCpf] = useState<string | null>(null);

  // States for dynamic sticker creation and management
  const [stickerRefresh, setStickerRefresh] = useState(0);
  const [editingStickerId, setEditingStickerId] = useState<number | null>(null);
  const [newStickerName, setNewStickerName] = useState('');
  const [customStickerId, setCustomStickerId] = useState('');
  const [newStickerRarity, setNewStickerRarity] = useState<'regular' | 'holografica' | 'lendaria' | 'suprema'>('regular');
  const [newStickerPage, setNewStickerPage] = useState<'trabalho' | 'evolucao' | 'hall'>('trabalho');
  const [newStickerImage, setNewStickerImage] = useState('');
  const [newStickerFile, setNewStickerFile] = useState<File | null>(null);
  const [stickerError, setStickerError] = useState('');
  const [stickerSuccess, setStickerSuccess] = useState('');
  const [stickerSearch, setStickerSearch] = useState('');
  const [isCreatingSticker, setIsCreatingSticker] = useState(false);
  const [isRestoringCatalog, setIsRestoringCatalog] = useState(false);
  const [isDeletingStickerId, setIsDeletingStickerId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.cpf || user.isAdmin) {
      setShowMarketNewsModal(false);
      return;
    }

    const cleanCpf = user.cpf.replace(/\D/g, '');
    const storageKey = `${MARKET_NEWS_STORAGE_PREFIX}_${cleanCpf}`;

    if (localStorage.getItem(storageKey) === 'seen') {
      setShowMarketNewsModal(false);
      return;
    }

    const marketNewsTimer = window.setTimeout(() => {
      setShowMarketNewsModal(true);
    }, 650);

    return () => window.clearTimeout(marketNewsTimer);
  }, [user?.cpf, user.isAdmin]);

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) => {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  };

  const handleStickerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStickerError('');
    setStickerSuccess('');

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Escolha um arquivo de imagem válido: WEBP, JPG ou PNG.');
      }

      if (file.size > MAX_STICKER_SOURCE_BYTES) {
        throw new Error('Essa imagem está muito pesada. Use uma imagem com até 8 MB antes da compressão.');
      }

      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler a imagem local.'));
        reader.readAsDataURL(file);
      });

      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Erro ao processar imagem. Tente outro arquivo PNG, JPG ou WEBP.'));
        img.src = dataUrl;
      });

      // Redimensiona para manter qualidade boa no álbum, mas sem deixar o upload pesado.
      const maxDim = STICKER_IMAGE_MAX_DIMENSION;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Seu navegador não conseguiu preparar a imagem para upload.');

      ctx.drawImage(img, 0, 0, width, height);

      const webpBlob = await canvasToBlob(canvas, 'image/webp', STICKER_IMAGE_QUALITY);
      const finalBlob = webpBlob || await canvasToBlob(canvas, 'image/jpeg', STICKER_IMAGE_QUALITY);
      if (!finalBlob) throw new Error('Não foi possível comprimir a imagem para upload.');
      if (finalBlob.size > MAX_STICKER_UPLOAD_BYTES) {
        throw new Error('Mesmo comprimida, a imagem passou de 1 MB. Tente uma imagem menor ou mais simples.');
      }

      const ext = webpBlob ? 'webp' : 'jpg';
      const compressedFile = new File(
        [finalBlob],
        `${file.name.replace(/\.[^.]+$/, '') || 'figurinha'}.${ext}`,
        { type: webpBlob ? 'image/webp' : 'image/jpeg' }
      );

      setNewStickerFile(compressedFile);
      setNewStickerImage(URL.createObjectURL(compressedFile));
      setStickerSuccess(`Imagem otimizada (${Math.round(compressedFile.size / 1024)} KB). Agora clique em salvar para enviar e aplicar no álbum.`);
      setTimeout(() => setStickerSuccess(''), 3500);
    } catch (err: any) {
      setNewStickerFile(null);
      setStickerError(err?.message || 'Erro ao preparar imagem para upload.');
    }
  };

  const handleCreateSticker = async (e: React.FormEvent) => {
    e.preventDefault();
    setStickerError('');
    setStickerSuccess('');

    const name = newStickerName.trim();
    if (!name) {
      setStickerError('Por favor, informe o nome da figurinha.');
      return;
    }

    setIsCreatingSticker(true);
    try {
      if (editingStickerId !== null) {
        // Edit mode
        const finalImage = newStickerFile
          ? await uploadStickerImageFile(newStickerFile, editingStickerId)
          : (newStickerImage.trim() || undefined);

        const updatedSticker: StickerDefinition = {
          id: editingStickerId,
          name,
          rarity: newStickerRarity,
          image: finalImage,
          page: newStickerPage
        };

        await dbUpdateSticker(updatedSticker);
        setStickerRefresh(prev => prev + 1);
        setNewStickerName('');
        setNewStickerImage('');
        setNewStickerFile(null);
        setEditingStickerId(null);
        setCustomStickerId('');
        setStickerSuccess(`Figurinha #${editingStickerId} "${name}" atualizada com sucesso!`);
        setTimeout(() => setStickerSuccess(''), 5000);
      } else {
        // Create mode
        const currentCatalog = getStoredStickers();
        
        let targetId = currentCatalog.length > 0 ? Math.max(...currentCatalog.map(s => s.id)) + 1 : 1;
        if (customStickerId.trim()) {
          const parsedId = parseInt(customStickerId.trim());
          if (isNaN(parsedId) || parsedId <= 0) {
            setStickerError('Por favor, insira um ID numérico inteiro positivo válido.');
            setIsCreatingSticker(false);
            return;
          }
          if (currentCatalog.some(s => s.id === parsedId)) {
            setStickerError(`Já existe uma figurinha no catálogo com o ID #${parsedId}. Escolha outro ID.`);
            setIsCreatingSticker(false);
            return;
          }
          targetId = parsedId;
        }

        const finalImage = newStickerFile
          ? await uploadStickerImageFile(newStickerFile, targetId)
          : (newStickerImage.trim() || undefined);

        const newSticker: StickerDefinition = {
          id: targetId,
          name,
          rarity: newStickerRarity,
          image: finalImage,
          page: newStickerPage
        };

        await dbInsertSticker(newSticker);
        setStickerRefresh(prev => prev + 1);
        setNewStickerName('');
        setNewStickerImage('');
        setNewStickerFile(null);
        setCustomStickerId('');
        setStickerSuccess(`Figurinha "${name}" cadastrada com sucesso!`);
        setTimeout(() => setStickerSuccess(''), 5000);
      }
    } catch (err: any) {
      console.error(err);
      setStickerError(`Erro ao salvar figurinha: ${err.message || 'Verifique a conexão, o bucket husf-stickers no Supabase Storage ou tente uma imagem menor.'}`);
    } finally {
      setIsCreatingSticker(false);
    }
  };

  const handleRestoreDefaultStickers = async () => {
    if (!confirm('Esta ação irá recriar todas as 17 figurinhas originais da Copa Celso (incluindo as Metas 1-6 em suas posições corretas, Celso Paredão, etc.). Figurinhas adicionais personalizadas já existentes não serão removidas. Deseja prosseguir?')) {
      return;
    }

    setIsRestoringCatalog(true);
    setStickerError('');
    setStickerSuccess('');
    try {
      const current = await dbGetStickers({ force: true });
      const merged = [...current];
      for (const def of DB_DEFAULT_STICKERS) {
        if (!merged.some(m => m.id === def.id)) {
          merged.push(def);
        }
      }
      merged.sort((a, b) => a.id - b.id);

      await dbSaveWholeCatalog(merged);
      setStickerRefresh(prev => prev + 1);
      setStickerSuccess('Álbum restaurado com sucesso! Figurinhas padrão (Metas 1-12 e Especiais) adicionadas/restauradas no sistema.');
      setTimeout(() => setStickerSuccess(''), 7000);
    } catch (err: any) {
      console.error(err);
      setStickerError(`Erro ao restaurar álbum padrão: ${err.message || err}`);
    } finally {
      setIsRestoringCatalog(false);
    }
  };

  const handleDeleteSticker = async (id: number) => {
    setIsDeletingStickerId(id);
    setStickerError('');
    setStickerSuccess('');
    try {
      await dbDeleteSticker(id);
      setStickerRefresh(prev => prev + 1);
      setStickerSuccess(`Figurinha deletada com sucesso do catálogo de compras.`);
      setTimeout(() => setStickerSuccess(''), 5000);
    } catch (err: any) {
      console.error(err);
      setStickerError(`Erro ao deletar figurinha na nuvem: ${err.message || err}`);
    } finally {
      setIsDeletingStickerId(null);
    }
  };

  const handleGiftSticker = async (targetCpf: string, stickerId: number) => {
    const currentUsers = await getAdminUsersSnapshot();
    let stickerName = `Figurinha #${stickerId}`;
    const foundSticker = getStickerById(stickerId);
    if (foundSticker) {
      stickerName = `"${foundSticker.name}"`;
    }
    let updatedTargetUser: User | null = null;
    const updated = currentUsers.map(u => {
      if (u.cpf === targetCpf) {
        const stickers = u.stickers || [];
        const nextUser = { ...u, stickers: [...stickers, stickerId] };
        updatedTargetUser = appendActivityLog(nextUser, createActivityEntry({
          type: 'sticker',
          title: 'Figurinha recebida do admin',
          description: `Recebeu a figurinha ${stickerName} pelo painel administrativo.`,
          stickerIds: [stickerId],
          coinsBefore: u.coins || 0,
          coinsAfter: u.coins || 0,
          actor: user.name
        }));
        return updatedTargetUser;
      }
      return u;
    });

    if (updatedTargetUser) {
      await dbSaveSingleUser(updatedTargetUser);
    }

    setUsersList(updated);
    
    if (updatedTargetUser && targetCpf === user.cpf && onUpdateUser && !sameUserData(user, updatedTargetUser)) {
      onUpdateUser(updatedTargetUser);
    }
    
    setNewRegSuccess(`Sucesso! A figurinha ${stickerName} foi adicionada ao inventário do colaborador.`);
    setTimeout(() => setNewRegSuccess(''), 4000);
  };

  // States for bulk/mass registration
  const [regMode, setRegMode] = useState<'individual' | 'massa'>('individual');
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkSummary, setBulkSummary] = useState<{
    success: number;
    duplicates: string[];
    invalid: string[];
  } | null>(null);

  // States for released safety goals (metas)
  const [releasedMetas, setReleasedMetas] = useState<number[]>(() => {
    const stored = localStorage.getItem('husf_released_metas');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [1, 2, 3, 4, 5, 6];
      } catch {
        return [1, 2, 3, 4, 5, 6];
      }
    }
    return [1, 2, 3, 4, 5, 6];
  });
  const [releasedMetasReady, setReleasedMetasReady] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(() => dbGetPendingUserSyncCount());
  const [virtualQueueStatus, setVirtualQueueStatus] = useState<VirtualQueueStatus | null>(null);
  const [virtualQueueReady, setVirtualQueueReady] = useState(false);
  const [virtualQueueRefreshKey, setVirtualQueueRefreshKey] = useState(0);
  const isAppClosedForUser = releasedMetasReady && !user.isAdmin && releasedMetas.length === 0;
  const shouldUseVirtualQueue = releasedMetasReady && !user.isAdmin && releasedMetas.length > 0;
  const isWaitingInVirtualQueue = shouldUseVirtualQueue && virtualQueueReady && virtualQueueStatus?.allowed === false;
  const isCheckingVirtualQueue = shouldUseVirtualQueue && !virtualQueueReady;
  const canLoadHeavyData = !isAppClosedForUser && (!shouldUseVirtualQueue || (virtualQueueReady && virtualQueueStatus?.allowed));

  const persistReleasedMetas = async (updated: number[]) => {
    setReleasedMetas(updated);
    setReleasedMetasReady(true);
    try {
      await dbSaveReleasedMetas(updated);
    } catch (err) {
      console.error('Erro ao sincronizar metas liberadas no Supabase:', err);
    }
  };

  const handleToggleMetaRelease = (metaId: number) => {
    let updated: number[];
    if (releasedMetas.includes(metaId)) {
      updated = releasedMetas.filter(id => id !== metaId);
    } else {
      updated = [...releasedMetas, metaId];
    }
    persistReleasedMetas(updated);
  };

  const handleReleaseAllMetas = () => {
    persistReleasedMetas([1, 2, 3, 4, 5, 6]);
  };

  const handleLockAllMetas = () => {
    persistReleasedMetas([]);
  };

  // Fila virtual: controla entrada simultânea quando há metas liberadas.
  // Quem estiver esperando não puxa módulos pesados do Supabase.
  // Correção: a fila agora revalida a entrada automaticamente a cada 15s.
  // Se alguém fechar o app e o navegador não avisar o Supabase, a vaga expira
  // em cerca de 45s e o próximo colaborador entra sozinho.
  useEffect(() => {
    if (!shouldUseVirtualQueue) {
      setVirtualQueueStatus(null);
      setVirtualQueueReady(false);
      return;
    }

    let active = true;
    let refreshing = false;
    const sessionId = getVirtualQueueSessionId();

    const refreshQueue = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const status = await dbEnterVirtualQueue(user, sessionId);
        if (active) {
          setVirtualQueueStatus(status);
          setVirtualQueueReady(true);
        }
      } catch (err) {
        console.warn('Não foi possível atualizar a fila virtual:', err);
        if (active) {
          setVirtualQueueStatus({
            allowed: true,
            position: 1,
            peopleAhead: 0,
            activeCount: 0,
            waitingCount: 0,
            maxActive: VIRTUAL_QUEUE_MAX_ACTIVE_USERS,
            queueUnavailable: true,
            message: err instanceof Error ? err.message : String(err)
          });
          setVirtualQueueReady(true);
        }
      } finally {
        refreshing = false;
      }
    };

    setVirtualQueueReady(false);
    refreshQueue();
    const interval = window.setInterval(refreshQueue, VIRTUAL_QUEUE_REFRESH_MS);

    const leaveQueueNow = () => {
      void dbLeaveVirtualQueue(user.cpf, sessionId);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshQueue();
      }
    };

    window.addEventListener('pagehide', leaveQueueNow);
    window.addEventListener('beforeunload', leaveQueueNow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('pagehide', leaveQueueNow);
      window.removeEventListener('beforeunload', leaveQueueNow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldUseVirtualQueue, user.cpf, user.name, user.sector, virtualQueueRefreshKey]);

  const handleLogoutAndLeaveQueue = () => {
    void dbLeaveVirtualQueue(user.cpf, getVirtualQueueSessionId());
    onLogout();
  };

  // Fetch and synchronize fresh statistics from Supabase Database asynchronously.
  // Modo econômico: não puxa usuários/figurinhas do banco a cada clique de aba.
  useEffect(() => {
    let active = true;

    async function loadFreshData() {
      if (!releasedMetasReady || !canLoadHeavyData) return;

      const needsUsers = activeTab === 'ranking' || activeTab === 'admin';
      const needsStickers = activeTab === 'album' || activeTab === 'loja' || activeTab === 'trocas' || activeTab === 'admin';

      if (needsUsers) {
        try {
          const freshUsers = await dbGetUsers({ force: adminRefresh > 0, maxRows: ADMIN_USERS_FETCH_LIMIT });
          if (active) {
            setUsersList(freshUsers);
          }
        } catch (e) {
          console.warn('Dashboard failed to parse fresh database user records:', e);
        }
      }

      if (needsStickers) {
        try {
          await dbGetStickers({ force: adminRefresh > 0 });
          if (active) {
            setStickerRefresh(prev => prev + 1);
          }
        } catch (e) {
          console.warn('Dashboard failed to parse fresh database stickers catalog:', e);
        }
      }
    }

    loadFreshData();
    return () => { active = false; };
  }, [adminRefresh, activeTab, releasedMetasReady, canLoadHeavyData]);

  // Realtime econômico: usuários só quando necessário.
  // App fechado não mantém websocket grande aberto no Supabase.
  useEffect(() => {
    if (!canLoadHeavyData) return;
    if (!user.isAdmin && activeTab !== 'ranking' && activeTab !== 'admin') return;

    let active = true;

    const persistUsersCache = (list: User[]) => {
      try {
        localStorage.setItem('husf_users', JSON.stringify(list));
      } catch (err) {
        console.warn('Não foi possível atualizar o cache local via realtime:', err);
      }
    };

    const applyUserRealtimePayload = (payload: any) => {
      if (!active) return;

      const row = payload?.new || payload?.old;
      if (!row?.cpf) return;

      const cleanPayloadCpf = normalizeCpf(row.cpf);

      setUsersList(prev => {
        let next: User[];

        if (payload?.eventType === 'DELETE') {
          next = prev.filter(u => normalizeCpf(u.cpf) !== cleanPayloadCpf);
        } else {
          const realtimeUser = mapSupabaseUserRow(row);
          const index = prev.findIndex(u => normalizeCpf(u.cpf) === cleanPayloadCpf);
          next = index >= 0
            ? prev.map((u, i) => (i === index ? realtimeUser : u))
            : [...prev, realtimeUser];

          if (normalizeCpf(user.cpf) === cleanPayloadCpf && onUpdateUser && shouldApplyRemoteUser(user, realtimeUser)) {
            onUpdateUser(realtimeUser);
          }
        }

        persistUsersCache(next);
        return next;
      });
    };

    const userSubscription = subscribeToUsers(applyUserRealtimePayload);

    return () => {
      active = false;
      userSubscription?.unsubscribe();
    };
  }, [user, onUpdateUser, activeTab, canLoadHeavyData]);

  useEffect(() => {
    if (!canLoadHeavyData) return;
    if (!['album', 'loja', 'trocas', 'admin'].includes(activeTab)) return;

    let active = true;

    const refreshStickersFromCloud = async () => {
      try {
        await dbGetStickers({ force: true });
        if (active) setStickerRefresh(prev => prev + 1);
      } catch (err) {
        console.warn('Erro ao atualizar figurinhas via realtime:', err);
      }
    };

    const stickerSubscription = subscribeToStickers(() => {
      refreshStickersFromCloud();
    });

    return () => {
      active = false;
      stickerSubscription?.unsubscribe();
    };
  }, [activeTab, canLoadHeavyData]);

  useEffect(() => {
    let active = true;

    const refreshReleasedMetas = async () => {
      try {
        const metas = await dbGetReleasedMetas();
        if (active) {
          setReleasedMetas(metas);
          setReleasedMetasReady(true);
        }
      } catch (err) {
        if (active) setReleasedMetasReady(true);
        console.warn('Erro ao atualizar liberação de metas via realtime:', err);
      }
    };

    refreshReleasedMetas();

    const settingsSubscription = subscribeToSettings((payload) => {
      const row = payload.new || payload.old;
      if (!row || row.key === 'released_metas') {
        refreshReleasedMetas();
      }
    });

    return () => {
      active = false;
      settingsSubscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const updatePendingCount = () => setPendingSyncCount(dbGetPendingUserSyncCount());
    updatePendingCount();
    window.addEventListener('online', updatePendingCount);
    const interval = window.setInterval(updatePendingCount, 10000);
    return () => {
      window.removeEventListener('online', updatePendingCount);
      window.clearInterval(interval);
    };
  }, []);


  const calculateUserEngagement = (u: User) => {
    // O ranking deve considerar sempre todas as 6 metas da Copa,
    // mesmo quando o admin libera apenas algumas no momento.
    const metaIds = RANKING_META_IDS;
    const totalMetas = metaIds.length || 6;
    const metaBreakdown = METAS.map(meta => {
      const progress = u.progress?.[meta.id];
      const completed = isMetaCompleted(progress);
      const answered = hasMetaQuizActivity(progress);
      return {
        id: meta.id,
        title: meta.title,
        desc: meta.desc,
        completed,
        answered,
        attempts: getMetaAttemptCount(progress),
        coins: progress?.totalCoinsEarned || 0
      };
    });

    const totalQuizCoins = metaIds.reduce((sum, metaId) => {
      const prog = u.progress?.[metaId];
      return sum + (prog?.totalCoinsEarned || 0);
    }, 0);

    const maxQuizCoins = totalMetas * 150;
    const aproveitamento = maxQuizCoins > 0 ? roundOneDecimal((totalQuizCoins / maxQuizCoins) * 100) : 0;
    const metasParticipadas = metaIds.filter(metaId => hasMetaQuizActivity(u.progress?.[metaId])).length;
    const metasConcluidas = metaIds.filter(metaId => isMetaCompleted(u.progress?.[metaId])).length;

    const totalQuestionsAnswered = metaIds.reduce((sum, metaId) => sum + (u.progress?.[metaId]?.totalQuestionsAnswered || 0), 0);
    const totalCorrectAnswers = metaIds.reduce((sum, metaId) => sum + (u.progress?.[metaId]?.totalCorrectAnswers || 0), 0);
    const totalResponseTimeMs = metaIds.reduce((sum, metaId) => sum + (u.progress?.[metaId]?.totalResponseTimeMs || 0), 0);
    const officialTimeMetrics = metaIds.reduce((acc, metaId) => {
      const progress = u.progress?.[metaId];
      if (!progress) return acc;

      // O cronômetro da tela é regressivo, de 20 para 0.
      // Para o ranking, o app sempre converte para tempo gasto:
      // tempo gasto = 20s - tempo restante. Se esgotar, conta 20s.
      // Exemplo: respondeu com 14s restantes => gastou 6s. Respondeu com 3s restantes => gastou 17s.
      const officialResponseTimeMs = typeof progress.lastAttemptResponseTimeMs === 'number' && progress.lastAttemptResponseTimeMs > 0
        ? progress.lastAttemptResponseTimeMs
        : (typeof progress.totalResponseTimeMs === 'number' && progress.totalResponseTimeMs > 0 ? progress.totalResponseTimeMs : 0);
      const officialQuestionsAnswered = typeof progress.lastAttemptQuestions === 'number' && progress.lastAttemptQuestions > 0
        ? progress.lastAttemptQuestions
        : (typeof progress.totalQuestionsAnswered === 'number' && progress.totalQuestionsAnswered > 0 ? progress.totalQuestionsAnswered : 0);

      if (officialResponseTimeMs > 0 && officialQuestionsAnswered > 0) {
        acc.totalOfficialResponseTimeMs += officialResponseTimeMs;
        acc.totalOfficialQuestionsAnswered += officialQuestionsAnswered;
        acc.metasComTempo += 1;
      }

      return acc;
    }, {
      totalOfficialResponseTimeMs: 0,
      totalOfficialQuestionsAnswered: 0,
      metasComTempo: 0
    });
    const averageResponseTimeMs = totalQuestionsAnswered > 0 ? totalResponseTimeMs / totalQuestionsAnswered : null;
    const officialAverageResponseTimeMs = officialTimeMetrics.totalOfficialQuestionsAnswered > 0
      ? officialTimeMetrics.totalOfficialResponseTimeMs / officialTimeMetrics.totalOfficialQuestionsAnswered
      : null;
    const hasSpeedData = !!officialAverageResponseTimeMs && officialTimeMetrics.totalOfficialQuestionsAnswered > 0;
    const speedScore = hasSpeedData
      ? roundOneDecimal(clampNumber(((RANKING_SPEED_LIMIT_MS - officialAverageResponseTimeMs) / RANKING_SPEED_LIMIT_MS) * 100))
      : RANKING_SPEED_NEUTRAL_SCORE;
    const completionScore = totalMetas > 0 ? roundOneDecimal((metasConcluidas / totalMetas) * 100) : 0;
    const participationScore = totalMetas > 0 ? roundOneDecimal((metasParticipadas / totalMetas) * 100) : 0;
    const accuracyScore = totalQuestionsAnswered > 0 ? roundOneDecimal((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;

    // Ranking oficial e auditável:
    // A ordem principal é o aproveitamento real nos quizzes: total de pontos conquistados / 900 pontos possíveis.
    // Velocidade, acertos, participação e nome entram apenas como desempate para não alterar a pontuação principal.
    const rankingScore = aproveitamento;

    return {
      totalQuizCoins,
      maxQuizCoins,
      aproveitamento,
      metasParticipadas,
      metasConcluidas,
      totalMetas,
      metaBreakdown,
      totalQuestionsAnswered,
      totalCorrectAnswers,
      totalResponseTimeMs,
      totalOfficialResponseTimeMs: officialTimeMetrics.totalOfficialResponseTimeMs,
      totalOfficialQuestionsAnswered: officialTimeMetrics.totalOfficialQuestionsAnswered,
      metasComTempo: officialTimeMetrics.metasComTempo,
      accuracyScore,
      averageResponseTimeMs: officialAverageResponseTimeMs || averageResponseTimeMs,
      averageResponseTimeLabel: formatAverageSeconds(officialAverageResponseTimeMs || averageResponseTimeMs),
      officialAverageResponseTimeMs,
      officialAverageResponseTimeLabel: formatAverageSeconds(officialAverageResponseTimeMs),
      officialTotalResponseTimeLabel: formatDurationSeconds(officialTimeMetrics.totalOfficialResponseTimeMs),
      hasSpeedData,
      speedScore,
      completionScore,
      participationScore,
      rankingScore
    };
  };

  const getRankingSourceUsers = () => {
    const currentCpf = normalizeCpf(user.cpf);
    const mergedUsers = usersList.some(u => normalizeCpf(u.cpf) === currentCpf)
      ? usersList.map(u => (normalizeCpf(u.cpf) === currentCpf ? user : u))
      : [...usersList, user];

    return getUniqueRankingCollaborators(mergedUsers);
  };

  const compareRankedUsers = <T extends User & { engagement: ReturnType<typeof calculateUserEngagement> }>(a: T, b: T) => {
    if (b.engagement.rankingScore !== a.engagement.rankingScore) return b.engagement.rankingScore - a.engagement.rankingScore;
    if (b.engagement.totalQuizCoins !== a.engagement.totalQuizCoins) return b.engagement.totalQuizCoins - a.engagement.totalQuizCoins;
    if (b.engagement.metasConcluidas !== a.engagement.metasConcluidas) return b.engagement.metasConcluidas - a.engagement.metasConcluidas;
    if (b.engagement.metasParticipadas !== a.engagement.metasParticipadas) return b.engagement.metasParticipadas - a.engagement.metasParticipadas;
    if (b.engagement.totalCorrectAnswers !== a.engagement.totalCorrectAnswers) return b.engagement.totalCorrectAnswers - a.engagement.totalCorrectAnswers;

    if (a.engagement.hasSpeedData && b.engagement.hasSpeedData && a.engagement.totalOfficialResponseTimeMs !== b.engagement.totalOfficialResponseTimeMs) {
      return a.engagement.totalOfficialResponseTimeMs - b.engagement.totalOfficialResponseTimeMs;
    }

    const nameCompare = a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    if (nameCompare !== 0) return nameCompare;

    return normalizeCpf(a.cpf).localeCompare(normalizeCpf(b.cpf));
  };

  const computeIndividualRanking = () => {
    return getRankingSourceUsers()
      .map(u => ({
        ...u,
        engagement: calculateUserEngagement(u)
      }))
      .sort(compareRankedUsers);
  };

  const computeSectorRanking = () => {
    const sectorMap: Record<string, {
      totalCoins: number;
      memberCount: number;
      totalQuizCoins: number;
      totalRankingScore: number;
      totalAproveitamento: number;
      totalSpeedScore: number;
      totalMetasConcluidas: number;
      totalMetasParticipadas: number;
      totalMetas: number;
      totalCorrectAnswers: number;
      totalQuestionsAnswered: number;
      totalResponseTimeMs: number;
      totalOfficialResponseTimeMs: number;
      totalOfficialQuestionsAnswered: number;
      speedDataCount: number;
    }> = {};

    getRankingSourceUsers().forEach(u => {
      const sectorName = getMonitoringSectorLabel(u);
      if (!sectorMap[sectorName]) {
        sectorMap[sectorName] = {
          totalCoins: 0,
          memberCount: 0,
          totalQuizCoins: 0,
          totalRankingScore: 0,
          totalAproveitamento: 0,
          totalSpeedScore: 0,
          totalMetasConcluidas: 0,
          totalMetasParticipadas: 0,
          totalMetas: 0,
          totalCorrectAnswers: 0,
          totalQuestionsAnswered: 0,
          totalResponseTimeMs: 0,
          totalOfficialResponseTimeMs: 0,
          totalOfficialQuestionsAnswered: 0,
          speedDataCount: 0
        };
      }

      const engagement = calculateUserEngagement(u);
      sectorMap[sectorName].totalCoins += u.coins || 0;
      sectorMap[sectorName].memberCount += 1;
      sectorMap[sectorName].totalQuizCoins += engagement.totalQuizCoins;
      sectorMap[sectorName].totalRankingScore += engagement.rankingScore;
      sectorMap[sectorName].totalAproveitamento += engagement.aproveitamento;
      sectorMap[sectorName].totalSpeedScore += engagement.speedScore;
      sectorMap[sectorName].totalMetasConcluidas += engagement.metasConcluidas;
      sectorMap[sectorName].totalMetasParticipadas += engagement.metasParticipadas;
      sectorMap[sectorName].totalMetas += engagement.totalMetas;
      sectorMap[sectorName].totalCorrectAnswers += engagement.totalCorrectAnswers;
      sectorMap[sectorName].totalQuestionsAnswered += engagement.totalQuestionsAnswered;
      sectorMap[sectorName].totalResponseTimeMs += engagement.totalResponseTimeMs;
      sectorMap[sectorName].totalOfficialResponseTimeMs += engagement.totalOfficialResponseTimeMs;
      sectorMap[sectorName].totalOfficialQuestionsAnswered += engagement.totalOfficialQuestionsAnswered;
      if (engagement.hasSpeedData) sectorMap[sectorName].speedDataCount += 1;
    });

    return Object.entries(sectorMap)
      .map(([name, data]) => {
        const maxSectorQuizCoins = data.totalMetas * 150;
        const score = maxSectorQuizCoins > 0 ? roundOneDecimal((data.totalQuizCoins / maxSectorQuizCoins) * 100) : 0;
        const aproveitamento = score;
        const speedScore = data.memberCount > 0 ? roundOneDecimal(data.totalSpeedScore / data.memberCount) : RANKING_SPEED_NEUTRAL_SCORE;
        const completionScore = data.totalMetas > 0 ? roundOneDecimal((data.totalMetasConcluidas / data.totalMetas) * 100) : 0;
        const participationScore = data.totalMetas > 0 ? roundOneDecimal((data.totalMetasParticipadas / data.totalMetas) * 100) : 0;
        const accuracyScore = data.totalQuestionsAnswered > 0 ? roundOneDecimal((data.totalCorrectAnswers / data.totalQuestionsAnswered) * 100) : 0;
        const averageResponseTimeMs = data.totalOfficialQuestionsAnswered > 0
          ? data.totalOfficialResponseTimeMs / data.totalOfficialQuestionsAnswered
          : (data.totalQuestionsAnswered > 0 ? data.totalResponseTimeMs / data.totalQuestionsAnswered : null);
        return {
          name,
          ...data,
          score,
          aproveitamento,
          speedScore,
          completionScore,
          participationScore,
          accuracyScore,
          averageResponseTimeMs,
          averageResponseTimeLabel: formatAverageSeconds(averageResponseTimeMs),
          officialTotalResponseTimeLabel: formatDurationSeconds(data.totalOfficialResponseTimeMs)
        };
      })
      .sort((a, b) => {
        const activeMetric = user.isAdmin ? sectorRankingMetric : 'average';
        if (activeMetric === 'average') {
          if (b.score !== a.score) return b.score - a.score;
          if (b.totalQuizCoins !== a.totalQuizCoins) return b.totalQuizCoins - a.totalQuizCoins;
          if (b.completionScore !== a.completionScore) return b.completionScore - a.completionScore;
          if (b.participationScore !== a.participationScore) return b.participationScore - a.participationScore;
          if (b.accuracyScore !== a.accuracyScore) return b.accuracyScore - a.accuracyScore;
          if (a.totalOfficialResponseTimeMs && b.totalOfficialResponseTimeMs && a.totalOfficialResponseTimeMs !== b.totalOfficialResponseTimeMs) return a.totalOfficialResponseTimeMs - b.totalOfficialResponseTimeMs;
          return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
        }
        if (b.totalCoins !== a.totalCoins) return b.totalCoins - a.totalCoins;
        if (b.totalQuizCoins !== a.totalQuizCoins) return b.totalQuizCoins - a.totalQuizCoins;
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      });
  };
  const individualRankingList = useMemo(() => computeIndividualRanking(), [usersList, user]);
  const sectorRankingList = useMemo(() => computeSectorRanking(), [usersList, sectorRankingMetric, user.isAdmin, user]);
  const visibleIndividualRanking = useMemo(() => individualRankingList.slice(0, RANKING_DISPLAY_LIMIT), [individualRankingList]);
  const visibleSectorRanking = useMemo(() => sectorRankingList.slice(0, RANKING_DISPLAY_LIMIT), [sectorRankingList]);
  const adminViewedUser = useMemo(() => {
    if (!adminViewedUserCpf) return null;
    const viewedCpf = normalizeCpf(adminViewedUserCpf);
    return usersList.find(u => normalizeCpf(u.cpf) === viewedCpf) || null;
  }, [usersList, adminViewedUserCpf]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const writeDashboardHistory = (route: DashboardHistoryState, mode: 'push' | 'replace' = 'push') => {
    if (typeof window === 'undefined') return;

    const currentState = window.history.state;
    const sameRoute = isDashboardHistoryState(currentState)
      && currentState.activeTab === route.activeTab
      && currentState.selectedMeta === route.selectedMeta
      && currentState.studyMetaId === route.studyMetaId
      && currentState.isQuizActive === route.isQuizActive
      && currentState.adminSection === route.adminSection;

    if (mode === 'push' && sameRoute) return;

    const url = `${window.location.pathname}${window.location.search}${buildDashboardHash(route)}`;
    if (mode === 'replace') {
      window.history.replaceState(route, '', url);
      return;
    }

    window.history.pushState(route, '', url);
  };

  const restoreDashboardRoute = (route: DashboardHistoryState) => {
    setActiveTab(route.activeTab);
    setSelectedMeta(route.selectedMeta);
    setStudyMetaId(route.studyMetaId);
    setIsQuizActive(route.isQuizActive);
    setAdminSection(route.adminSection);
    setQuizResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const initialRoute: DashboardHistoryState = parseDashboardHash() || {
      husfDashboardRoute: true,
      activeTab: 'inicio',
      selectedMeta: null,
      studyMetaId: null,
      isQuizActive: false,
      adminSection: 'overview',
    };

    restoreDashboardRoute(initialRoute);
    writeDashboardHistory(initialRoute, 'replace');

    const handleBrowserBack = (event: PopStateEvent) => {
      if (isDashboardHistoryState(event.state)) {
        restoreDashboardRoute(event.state);
      }
    };

    window.addEventListener('popstate', handleBrowserBack);
    return () => window.removeEventListener('popstate', handleBrowserBack);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: TabContent, mode: 'push' | 'replace' = 'push') => {
    const route: DashboardHistoryState = {
      husfDashboardRoute: true,
      activeTab: tab,
      selectedMeta: null,
      studyMetaId: null,
      isQuizActive: false,
      adminSection,
    };

    setActiveTab(tab);
    setStudyMetaId(null);
    setIsQuizActive(false);
    setQuizResult(null);
    setSelectedMeta(null);
    writeDashboardHistory(route, mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markMarketNewsAsSeen = () => {
    if (!user?.cpf) return;
    const cleanCpf = user.cpf.replace(/\D/g, '');
    localStorage.setItem(`${MARKET_NEWS_STORAGE_PREFIX}_${cleanCpf}`, 'seen');
  };

  const handleCloseMarketNews = (openMarket = false) => {
    markMarketNewsAsSeen();
    setShowMarketNewsModal(false);

    if (openMarket) {
      setTradingInitialMode('mercado');
      handleTabChange('trocas');
    }
  };

  const handleAdminSectionChange = (section: AdminSection, mode: 'push' | 'replace' = 'push') => {
    const route: DashboardHistoryState = {
      husfDashboardRoute: true,
      activeTab: 'admin',
      selectedMeta: null,
      studyMetaId: null,
      isQuizActive: false,
      adminSection: section,
    };

    setActiveTab('admin');
    setSelectedMeta(null);
    setStudyMetaId(null);
    setIsQuizActive(false);
    setQuizResult(null);
    setAdminSection(section);
    writeDashboardHistory(route, mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMeta = (metaId: number, mode: 'push' | 'replace' = 'push') => {
    const route: DashboardHistoryState = {
      husfDashboardRoute: true,
      activeTab: 'desafios',
      selectedMeta: metaId,
      studyMetaId: null,
      isQuizActive: false,
      adminSection,
    };

    setActiveTab('desafios');
    setSelectedMeta(metaId);
    setStudyMetaId(null);
    setIsQuizActive(false);
    setQuizResult(null);
    writeDashboardHistory(route, mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToChallenges = () => {
    const route: DashboardHistoryState = {
      husfDashboardRoute: true,
      activeTab: 'desafios',
      selectedMeta: null,
      studyMetaId: null,
      isQuizActive: false,
      adminSection,
    };

    setSelectedMeta(null);
    setStudyMetaId(null);
    setIsQuizActive(false);
    setQuizResult(null);
    writeDashboardHistory(route, 'replace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudyMaterial = (metaId: number | null = null) => {
    const route: DashboardHistoryState = {
      husfDashboardRoute: true,
      activeTab: 'estudo',
      selectedMeta,
      studyMetaId: metaId,
      isQuizActive: false,
      adminSection,
    };

    setStudyMetaId(metaId);
    setActiveTab('estudo');
    setIsQuizActive(false);
    setQuizResult(null);
    writeDashboardHistory(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseStudyMaterial = () => {
    if (selectedMeta !== null) {
      handleSelectMeta(selectedMeta, 'replace');
      return;
    }
    handleTabChange('inicio', 'replace');
  };

  const startQuiz = () => {
    const route: DashboardHistoryState = {
      husfDashboardRoute: true,
      activeTab: 'desafios',
      selectedMeta,
      studyMetaId: null,
      isQuizActive: true,
      adminSection,
    };

    setIsQuizActive(true);
    setQuizResult(null);
    writeDashboardHistory(route);
  };

  const stopQuiz = (mode: 'push' | 'replace' = 'replace') => {
    const route: DashboardHistoryState = {
      husfDashboardRoute: true,
      activeTab: 'desafios',
      selectedMeta,
      studyMetaId: null,
      isQuizActive: false,
      adminSection,
    };

    setIsQuizActive(false);
    setQuizResult(null);
    writeDashboardHistory(route, mode);
  };

  const handleQuizComplete = (coinsEarned: number, correctAnswers: number, newProgress: MetaProgress) => {
    onQuizFinish(newProgress.metaId, coinsEarned, correctAnswers, newProgress);
    setIsQuizActive(false);
    setQuizResult({ coins: coinsEarned, correct: correctAnswers });
    writeDashboardHistory({
      husfDashboardRoute: true,
      activeTab: 'desafios',
      selectedMeta: newProgress.metaId,
      studyMetaId: null,
      isQuizActive: false,
      adminSection,
    }, 'replace');
  };

  const handleRegisterCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewRegError('');
    setNewRegSuccess('');

    const formattedCpf = newRegCpf.trim();
    const name = newRegName.trim();
    const sector = newRegSector.trim();

    if (!formattedCpf || !name || !sector) {
      setNewRegError('Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (formattedCpf.length < 14) {
      setNewRegError('O CPF digitado está incompleto. Formato esperado: 111.111.111-11');
      return;
    }

    const currentUsers = await getAdminUsersSnapshot();
    if (currentUsers.some(u => u.cpf === formattedCpf)) {
      setNewRegError(`O CPF ${formattedCpf} já está cadastrado para o colaborador ${currentUsers.find(u => u.cpf === formattedCpf)?.name || ''}.`);
      return;
    }

    const newUser: User = appendActivityLog({
      cpf: formattedCpf,
      name,
      sector,
      coins: 30,
      stickers: [],
      progress: {}
    }, createActivityEntry({
      type: 'system',
      title: 'Perfil criado',
      description: `Colaborador cadastrado no setor ${sector} com saldo inicial de 30 moedas.`,
      points: 30,
      coinsBefore: 0,
      coinsAfter: 30,
      actor: user.name
    }));

    const updated = [...currentUsers, newUser];
    await dbSaveSingleUser(newUser);
    setUsersList(updated);

    setNewRegCpf('');
    setNewRegName('');
    setNewRegSuccess(`Sucesso! ${name} foi cadastrado(a) no setor ${sector} e já pode jogar!`);

    setTimeout(() => {
      setNewRegSuccess('');
    }, 6000);
  };

  const cleanAndFormatCPF = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 11) {
      return raw.trim();
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleBulkRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');
    setBulkSummary(null);

    const txt = bulkText.trim();
    if (!txt) {
      setBulkError('Por favor, insira ou cole a lista de colaboradores.');
      return;
    }

    const lines = txt.split('\n');
    const currentUsers = await getAdminUsersSnapshot();
    
    const newAddedUsers: User[] = [];
    const duplicates: string[] = [];
    const invalid: string[] = [];
    let successCount = 0;
    const addedCpfInBatch = new Set<string>();

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Try splitting by semicolon, tab, comma, or pipe
      let parts = trimmedLine.split(';');
      if (parts.length < 2) parts = trimmedLine.split('\t');
      if (parts.length < 2) parts = trimmedLine.split(',');
      if (parts.length < 2) parts = trimmedLine.split('|');

      const cleanParts = parts.map(p => p.trim().replace(/^["']|["']$/g, ''));

      if (cleanParts.length < 2) {
        invalid.push(`Linha ${index + 1}: Formato inválido. Use "CPF ; Nome ; Setor".`);
        return;
      }

      const rawCpf = cleanParts[0];
      const name = cleanParts[1];
      const sector = cleanParts[2] || 'Outro Setor';

      if (!rawCpf || !name) {
        invalid.push(`Linha ${index + 1}: CPF ou Nome vazios.`);
        return;
      }

      const formattedCpf = cleanAndFormatCPF(rawCpf);

      if (formattedCpf.length < 14) {
        invalid.push(`Linha ${index + 1} (${name}): CPF "${rawCpf}" é inválido.`);
        return;
      }

      if (currentUsers.some(u => u.cpf === formattedCpf)) {
        duplicates.push(`${name} (${formattedCpf})`);
        return;
      }

      if (addedCpfInBatch.has(formattedCpf)) {
        duplicates.push(`${name} (CPF ${formattedCpf} repetido no texto)`);
        return;
      }

      addedCpfInBatch.add(formattedCpf);
      newAddedUsers.push(appendActivityLog({
        cpf: formattedCpf,
        name,
        sector,
        coins: 30,
        stickers: [],
        progress: {}
      }, createActivityEntry({
        type: 'system',
        title: 'Perfil criado em lote',
        description: `Colaborador importado para o setor ${sector} com saldo inicial de 30 moedas.`,
        points: 30,
        coinsBefore: 0,
        coinsAfter: 30,
        actor: user.name
      })));
      successCount++;
    });

    if (newAddedUsers.length > 0) {
      const updated = [...currentUsers, ...newAddedUsers];
      await Promise.all(newAddedUsers.map(newUser => dbSaveSingleUser(newUser)));
      setUsersList(updated);
        setBulkSuccess(`Importação concluída! ${successCount} colaboradores cadastrados com sucesso.`);
      setBulkText('');
    } else {
      setBulkError('Nenhum colaborador novo foi cadastrado. Verifique os erros listados abaixo.');
    }

    setBulkSummary({
      success: successCount,
      duplicates,
      invalid
    });
  };

  const handleRewardUser = async (targetCpf: string, amount: number) => {
    const currentUsers = await getAdminUsersSnapshot();
    let updatedTargetUser: User | null = null;
    const updated = currentUsers.map(u => {
      if (u.cpf === targetCpf) {
        const coinsBefore = u.coins || 0;
        const coinsAfter = coinsBefore + amount;
        updatedTargetUser = appendActivityLog({ ...u, coins: coinsAfter }, createActivityEntry({
          type: 'reward',
          title: `Recompensa administrativa +${amount} moedas`,
          description: `${user.name} creditou +${amount} moedas pelo painel administrativo.`,
          points: amount,
          coinsBefore,
          coinsAfter,
          actor: user.name
        }));
        return updatedTargetUser;
      }
      return u;
    });

    if (updatedTargetUser) {
      await dbSaveSingleUser(updatedTargetUser);
    }

    setUsersList(updated);
    
    if (updatedTargetUser && targetCpf === user.cpf && onUpdateUser && !sameUserData(user, updatedTargetUser)) {
      onUpdateUser(updatedTargetUser);
    }
    

    // Toast-like notification of reward using success banner for feedback
    setNewRegSuccess(`Sucesso! Foram creditadas +${amount} moedas ao colaborador.`);
    setTimeout(() => setNewRegSuccess(''), 4000);
  };

  const handleDeleteUser = async (targetCpf: string) => {
    if (targetCpf === user.cpf) {
      setNewRegError('Você não pode excluir o seu próprio usuário administrador logado!');
      return;
    }
    const currentUsers = await getAdminUsersSnapshot();
    const updated = currentUsers.filter(u => u.cpf !== targetCpf);
    await dbDeleteUser(targetCpf);
    setUsersList(updated);
    setConfirmDeleteCpf(null);
    
    setNewRegSuccess('Colaborador removido com sucesso de nosso banco de dados hospitalar.');
    setTimeout(() => setNewRegSuccess(''), 4000);
  };

  const allStickersCatalog = useMemo(() => {
    return getAllStickers();
  }, [stickerRefresh]);

  const filteredStickers = useMemo(() => {
    return allStickersCatalog
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.id - b.id);
  }, [allStickersCatalog, searchQuery]);

  const groupedStickers = useMemo(() => {
    const groups: { title: string; color: string; bgColor: string; numColor: string; stickers: typeof filteredStickers }[] = [];
    if (searchQuery) {
       groups.push({ title: 'Resultados da Busca', color: 'from-slate-600 to-slate-800', bgColor: 'bg-slate-100 border-slate-200', numColor: 'text-slate-300', stickers: filteredStickers });
       return groups;
    }

    const getPage = (s: typeof filteredStickers[0]) => {
      if (s.page) return s.page;
      if (s.id >= 1 && s.id <= 6) return 'trabalho';
      if (s.id >= 7 && s.id <= 12) return 'evolucao';
      return 'hall';
    };
    
    const page1 = filteredStickers.filter(s => getPage(s) === 'trabalho');
    if (page1.length) groups.push({ title: 'Trabalho em Equipe', color: 'from-[#009b3a] to-[#007028]', bgColor: 'bg-[#e8f5e9] border-[#c8e6c9]', numColor: 'text-[#c8e6c9]/80', stickers: page1 });
    
    const page2 = filteredStickers.filter(s => getPage(s) === 'evolucao');
    if (page2.length) groups.push({ title: 'Evolução Contínua', color: 'from-[#002776] to-[#001746]', bgColor: 'bg-[#e3f2fd] border-[#bbdefb]', numColor: 'text-[#bbdefb]/80', stickers: page2 });
    
    const especiais = filteredStickers.filter(s => getPage(s) === 'hall');
    if (especiais.length) groups.push({ title: 'Hall da Fama', color: 'from-[#fedf00] to-[#e6c200]', bgColor: 'bg-[#fffde7] border-[#fff59d]', numColor: 'text-[#fff59d]/80', stickers: especiais });
    
    return groups;
  }, [filteredStickers, searchQuery]);
  const currentUserActivity = useMemo(() => getActivityLog(user).slice(0, 10), [user]);

  const collaboratorHomeSummary = useMemo(() => {
    const rankedUsers = individualRankingList;

    const currentEngagement = calculateUserEngagement(user);
    const currentCpf = normalizeCpf(user.cpf);
    const rankIndex = user.isAdmin ? -1 : rankedUsers.findIndex(u => normalizeCpf(u.cpf) === currentCpf);
    const nextRanked = rankIndex > 0 ? rankedUsers[rankIndex - 1] : undefined;
    const nextIncompleteReleasedMeta = METAS.find(meta =>
      releasedMetas.includes(meta.id) && !isMetaCompleted(user.progress?.[meta.id])
    );
    const nextIncompleteAnyMeta = METAS.find(meta => !isMetaCompleted(user.progress?.[meta.id]));
    const nextMeta = nextIncompleteReleasedMeta || nextIncompleteAnyMeta;
    const lastActivity = currentUserActivity[0];

    return {
      rankPosition: rankIndex >= 0 ? rankIndex + 1 : null,
      totalRanked: rankedUsers.length,
      nextRankedName: nextRanked?.name,
      pointsToNextRank: nextRanked ? Math.max(1, nextRanked.engagement.totalQuizCoins - currentEngagement.totalQuizCoins + 1) : 0,
      engagementPercent: currentEngagement.rankingScore,
      totalQuizCoins: currentEngagement.totalQuizCoins,
      maxQuizCoins: currentEngagement.maxQuizCoins,
      completedMetas: currentEngagement.metasConcluidas,
      participatedMetas: currentEngagement.metasParticipadas,
      stickersCollected: user.stickers?.length || 0,
      stickersTotal: allStickersCatalog.length,
      lastActivityTitle: lastActivity?.title,
      lastActivityTime: lastActivity ? formatActivityTime(lastActivity.createdAt) : undefined,
      nextMetaId: nextMeta?.id,
      nextMetaTitle: nextMeta ? `${nextMeta.title}: ${nextMeta.desc}` : undefined,
      nextMetaCoins: nextMeta ? (user.progress?.[nextMeta.id]?.totalCoinsEarned || 0) : undefined,
      hasReleasedPendingMeta: !!nextIncompleteReleasedMeta
    };
  }, [individualRankingList, user, allStickersCatalog.length, releasedMetas, currentUserActivity]);

  const adminActivityLog = useMemo(() => {
    const normalizedUsers = usersList.some(u => u.cpf === user.cpf)
      ? usersList.map(u => (u.cpf === user.cpf ? user : u))
      : [...usersList, user];

    return normalizedUsers
      .flatMap((u) => getActivityLog(u).map((entry) => ({ entry, user: u })))
      .sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime())
      .slice(0, 30);
  }, [usersList, user]);

  const activitiesThisWeek = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return adminActivityLog.filter(item => new Date(item.entry.createdAt).getTime() >= sevenDaysAgo).length;
  }, [adminActivityLog]);

  const inactiveCollaborators = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return usersList
      .filter(u => !u.isAdmin)
      .map(u => ({
        user: u,
        lastActivityAt: getActivityLog(u)[0]?.createdAt || null
      }))
      .filter(item => !item.lastActivityAt || new Date(item.lastActivityAt).getTime() < sevenDaysAgo)
      .slice(0, 8);
  }, [usersList]);

  const monitoringCollaborators = useMemo(() => getUniqueMonitoringCollaborators(usersList), [usersList]);

  const adminQuizSectorOptions = useMemo(() => {
    const sectorByKey = new Map<string, string>();
    monitoringCollaborators.forEach((user) => {
      const sector = getMonitoringSectorLabel(user);
      const key = normalizeSectorKey(sector);
      if (key && !sectorByKey.has(key)) sectorByKey.set(key, sector);
    });
    return Array.from(sectorByKey.values()).sort((a, b) => a.localeCompare(b));
  }, [monitoringCollaborators]);

  useEffect(() => {
    setAdminQuizPage(0);
  }, [adminQuizSectorFilter]);

  const adminQuizSectorReport = useMemo(() => {
    const selectedSectorKey = normalizeSectorKey(adminQuizSectorFilter);
    const collaborators = monitoringCollaborators
      .filter(u => adminQuizSectorFilter === 'all' || normalizeSectorKey(u.sector) === selectedSectorKey);

    const rows = collaborators
      .map((collaborator) => {
        const metaStatuses = METAS.map((meta) => {
          const progress = collaborator.progress?.[meta.id];
          const answered = hasMetaQuizActivity(progress);
          const completed = isMetaCompleted(progress);
          return {
            metaId: meta.id,
            label: `M${meta.id}`,
            answered,
            completed,
            attempts: getMetaAttemptCount(progress),
            coins: progress?.totalCoinsEarned || 0
          };
        });

        const didAnyQuiz = metaStatuses.some(item => item.answered);
        const completedCount = metaStatuses.filter(item => item.completed).length;
        const answeredCount = metaStatuses.filter(item => item.answered).length;
        const quizActivities = getActivityLog(collaborator).filter(entry => entry.type === 'quiz');
        const lastQuizAt = quizActivities[0]?.createdAt || null;
        const engagement = calculateUserEngagement(collaborator);

        return {
          collaborator,
          metaStatuses,
          didAnyQuiz,
          completedCount,
          answeredCount,
          lastQuizAt,
          engagement
        };
      })
      .sort((a, b) => Number(a.didAnyQuiz) - Number(b.didAnyQuiz) || a.collaborator.name.localeCompare(b.collaborator.name));

    const total = rows.length;
    const didQuiz = rows.filter(row => row.didAnyQuiz).length;
    const completedAtLeastOne = rows.filter(row => row.completedCount > 0).length;
    const pending = total - didQuiz;
    const averageEngagement = total > 0
      ? Math.round((rows.reduce((sum, row) => sum + row.engagement.aproveitamento, 0) / total) * 10) / 10
      : 0;

    const metaTotals = METAS.map((meta) => {
      const answered = rows.filter(row => row.metaStatuses.find(item => item.metaId === meta.id)?.answered).length;
      const completed = rows.filter(row => row.metaStatuses.find(item => item.metaId === meta.id)?.completed).length;
      return {
        meta,
        answered,
        completed,
        answeredRate: total > 0 ? Math.round((answered / total) * 1000) / 10 : 0,
        completedRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0
      };
    });

    const totalPages = Math.max(1, Math.ceil(rows.length / ADMIN_MONITORING_PAGE_SIZE));
    const safePage = Math.min(adminQuizPage, totalPages - 1);
    const pageStart = safePage * ADMIN_MONITORING_PAGE_SIZE;
    const paginatedRows = rows.slice(pageStart, pageStart + ADMIN_MONITORING_PAGE_SIZE);

    return {
      selectedSector: adminQuizSectorFilter === 'all' ? 'Todos os setores' : adminQuizSectorFilter,
      total,
      didQuiz,
      completedAtLeastOne,
      pending,
      averageEngagement,
      rows,
      paginatedRows,
      totalPages,
      currentPage: safePage,
      pageStart,
      pageEnd: Math.min(pageStart + ADMIN_MONITORING_PAGE_SIZE, rows.length),
      metaTotals
    };
  }, [monitoringCollaborators, adminQuizSectorFilter, adminQuizPage]);

  const adminEngagementReport = useMemo(() => {
    const collaborators = getRankingSourceUsers();
    const totalCollaborators = collaborators.length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const collaboratorStats = collaborators.map((collaborator) => {
      const engagement = calculateUserEngagement(collaborator);
      const lastActivityAt = getActivityLog(collaborator)[0]?.createdAt || null;
      const isActiveThisWeek = !!lastActivityAt && new Date(lastActivityAt).getTime() >= sevenDaysAgo;
      return { collaborator, engagement, lastActivityAt, isActiveThisWeek };
    });

    const totalQuizCoins = collaboratorStats.reduce((sum, item) => sum + item.engagement.totalQuizCoins, 0);
    const totalPossibleCoins = totalCollaborators * METAS.length * 150;
    const averageEngagement = totalPossibleCoins > 0
      ? Math.round((totalQuizCoins / totalPossibleCoins) * 1000) / 10
      : 0;
    const activeThisWeek = collaboratorStats.filter(item => item.isActiveThisWeek).length;
    const activeRate = totalCollaborators > 0
      ? Math.round((activeThisWeek / totalCollaborators) * 1000) / 10
      : 0;

    const sectorMap: Record<string, { members: number; totalQuizCoins: number; totalEngagement: number; activeThisWeek: number }> = {};
    collaboratorStats.forEach(({ collaborator, engagement, isActiveThisWeek }) => {
      if (!sectorMap[collaborator.sector]) {
        sectorMap[collaborator.sector] = { members: 0, totalQuizCoins: 0, totalEngagement: 0, activeThisWeek: 0 };
      }
      sectorMap[collaborator.sector].members += 1;
      sectorMap[collaborator.sector].totalQuizCoins += engagement.totalQuizCoins;
      sectorMap[collaborator.sector].totalEngagement += engagement.aproveitamento;
      if (isActiveThisWeek) sectorMap[collaborator.sector].activeThisWeek += 1;
    });

    const sectorReports = Object.entries(sectorMap)
      .map(([sector, data]) => ({
        sector,
        ...data,
        averageEngagement: data.members > 0 ? Math.round((data.totalEngagement / data.members) * 10) / 10 : 0,
        activeRate: data.members > 0 ? Math.round((data.activeThisWeek / data.members) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.averageEngagement - a.averageEngagement || b.totalQuizCoins - a.totalQuizCoins);

    const metaReports = METAS.map((meta) => {
      const participants = collaborators.filter(c => (c.progress?.[meta.id]?.totalCoinsEarned || 0) > 0).length;
      const completed = collaborators.filter(c => isMetaCompleted(c.progress?.[meta.id])).length;
      const totalCoins = collaborators.reduce((sum, c) => sum + (c.progress?.[meta.id]?.totalCoinsEarned || 0), 0);
      const maxCoins = totalCollaborators * 150;
      return {
        meta,
        participants,
        completed,
        totalCoins,
        participationRate: totalCollaborators > 0 ? Math.round((participants / totalCollaborators) * 1000) / 10 : 0,
        completionRate: totalCollaborators > 0 ? Math.round((completed / totalCollaborators) * 1000) / 10 : 0,
        engagementRate: maxCoins > 0 ? Math.round((totalCoins / maxCoins) * 1000) / 10 : 0
      };
    });

    const sortedMetasByEngagement = [...metaReports].sort((a, b) => b.engagementRate - a.engagementRate || b.participants - a.participants);
    const individualRanking = individualRankingList;
    const riskCollaborators = collaboratorStats
      .filter(item => item.engagement.aproveitamento < 50 || !item.isActiveThisWeek)
      .sort((a, b) => a.engagement.aproveitamento - b.engagement.aproveitamento)
      .slice(0, 6);

    return {
      totalCollaborators,
      totalQuizCoins,
      totalPossibleCoins,
      averageEngagement,
      activeThisWeek,
      activeRate,
      inactiveCount: collaboratorStats.filter(item => !item.isActiveThisWeek).length,
      topSector: sectorReports[0],
      lowSector: sectorReports.length > 1 ? sectorReports[sectorReports.length - 1] : undefined,
      topCollaborator: individualRanking[0],
      sectorReports,
      metaReports,
      bestMeta: sortedMetasByEngagement[0],
      attentionMeta: sortedMetasByEngagement[sortedMetasByEngagement.length - 1],
      riskCollaborators
    };
  }, [usersList, user, individualRankingList]);

  if (isAppClosedForUser) {
    return <AppClosedScreen user={user} onLogout={handleLogoutAndLeaveQueue} releasedMetasReady={releasedMetasReady} />;
  }

  if (isCheckingVirtualQueue || isWaitingInVirtualQueue) {
    return (
      <VirtualQueueScreen
        user={user}
        status={virtualQueueStatus}
        queueReady={virtualQueueReady}
        onRefresh={() => setVirtualQueueRefreshKey(prev => prev + 1)}
        onLogout={handleLogoutAndLeaveQueue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 p-2 sm:p-6 lg:p-8">
        
        {/* Sidebar / Header */}
        <div className="w-full lg:w-80 shrink-0 space-y-4 lg:space-y-6">
          
          {/* User Profile Card */}
          <div className={`bg-white p-4 sm:p-5 rounded-2xl shadow-sm border flex flex-col gap-4 ${user.isAdmin ? 'border-purple-300 ring-4 ring-purple-100/40 bg-gradient-to-b from-purple-50/20 via-white to-white' : 'border-slate-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0 border-2 ${user.isAdmin ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' : 'bg-brand-100 text-brand-700 border-brand-200'}`}>
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-slate-500 font-medium mb-0.5">{getGreeting()},</p>
                  {user.isAdmin && (
                    <span className="bg-purple-600 text-white text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 scale-90 mb-0.5 select-none">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      ADMIN
                    </span>
                  )}
                </div>
                <h2 className="font-bold text-slate-800 text-lg sm:text-xl leading-tight safe-text font-[Space_Grotesk] uppercase">{user.name}</h2>
                <div className="flex items-center text-xs sm:text-sm text-slate-500 gap-1.5 mt-1 safe-text">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="safe-text">{user.sector}</span>
                </div>


              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
              <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-sm shadow-sm whitespace-nowrap">
                <Coins className="w-4 h-4 text-amber-500" />
                {user.coins} Moedas
              </div>
              <button
                onClick={handleLogoutAndLeaveQueue}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center group gap-2"
                title="Sair"
              >
                <span className="hidden sm:inline lg:hidden group-hover:text-red-600">Sair</span>
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>

          {pendingSyncCount > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Progresso protegido</p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-800">
                    {pendingSyncCount} atualização{pendingSyncCount === 1 ? '' : 'ões'} ficou/ficaram salva(s) neste aparelho e será/serão reenviada(s) ao Supabase automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="bg-white p-2 sm:p-3 lg:p-4 rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] sm:shadow-sm border-t sm:border border-slate-100 flex lg:flex-col gap-1 sm:gap-2 fixed sm:static bottom-0 left-0 right-0 z-50 justify-start lg:justify-start px-2 sm:px-3 lg:px-4 pb-6 sm:pb-3 lg:pb-4 overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => handleTabChange('inicio')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'inicio' ? 'bg-brand-600 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Home className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'inicio' ? 'text-brand-200' : 'text-slate-400 group-hover:text-brand-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Início</span>
            </button>
            <button 
              onClick={() => handleTabChange('desafios')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'desafios' ? 'bg-brand-600 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Trophy className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'desafios' ? 'text-brand-200' : 'text-slate-400 group-hover:text-brand-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Desafios</span>
            </button>
            <button 
              onClick={() => handleTabChange('estudo')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'estudo' ? 'bg-brand-600 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <BookOpen className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'estudo' ? 'text-brand-200' : 'text-slate-400 group-hover:text-brand-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Apostila</span>
            </button>
            <button 
              onClick={() => handleTabChange('album')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'album' ? 'bg-brand-600 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutGrid className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'album' ? 'text-brand-200' : 'text-slate-400 group-hover:text-brand-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Álbum</span>
            </button>
            <button 
              onClick={() => handleTabChange('loja')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'loja' ? 'bg-amber-500 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-amber-50'}`}
            >
              <ShoppingBag className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'loja' ? 'text-amber-200' : 'text-slate-400 group-hover:text-amber-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Loja</span>
            </button>
            <button 
              onClick={() => handleTabChange('trocas')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'trocas' ? 'bg-indigo-500 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-indigo-50'}`}
            >
              <ArrowRightLeft className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'trocas' ? 'text-indigo-200' : 'text-slate-400 group-hover:text-indigo-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Trocas</span>
            </button>
            <button 
              onClick={() => handleTabChange('ranking')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'ranking' ? 'bg-brand-600 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Crown className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'ranking' ? 'text-brand-200' : 'text-slate-400 group-hover:text-amber-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Ranking</span>
            </button>
            <button 
              onClick={() => handleTabChange('perfil')}
              className={`group flex-none sm:flex-1 lg:w-full min-w-[58px] sm:min-w-0 rounded-xl py-2 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-3 transition-all ${activeTab === 'perfil' ? 'bg-brand-600 text-white shadow-md scale-[1.03] sm:scale-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <UserIcon className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'perfil' ? 'text-brand-200' : 'text-slate-400 group-hover:text-brand-500'}`} />
              <span className="text-[9px] sm:text-base leading-none">Perfil</span>
            </button>
            {user.isAdmin && (
              <button 
                onClick={() => handleTabChange('admin')}
                className={`group flex-none sm:flex-[0.8] lg:w-full min-w-[66px] sm:min-w-0 rounded-xl py-2 sm:py-3 px-1 sm:px-4 font-bold flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-1 sm:gap-3 transition-all ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-md scale-[1.03] sm:scale-100 animate-pulse' : 'text-purple-600 hover:bg-purple-50'}`}
              >
                <ShieldCheck className={`w-5 h-5 sm:w-5 sm:h-5 ${activeTab === 'admin' ? 'text-purple-200' : 'text-purple-500 group-hover:text-purple-600'}`} />
                <span className="text-[10px] sm:text-base leading-none text-purple-700 font-extrabold group-hover:text-purple-800">Gestão</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 pb-24 sm:pb-0">
          <AnimatePresence mode="wait">
          {activeTab === 'estudo' && (
            <motion.div
              key="estudo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <StudyMaterial 
                onClose={handleCloseStudyMaterial}
                initialMetaId={studyMetaId}
              />
            </motion.div>
          )}

          {activeTab === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Suspense fallback={<LazyPanelFallback />}>
                <WelcomeScreen user={user} onNavigate={handleTabChange} summary={collaboratorHomeSummary} />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'desafios' && (
            <motion.div 
              key="desafios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {selectedMeta === null ? (
                <>
                  <div className="bg-brand-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500 blur-3xl opacity-50 pointer-events-none" />
                    
                    <h1 className="text-3xl font-bold mb-2 relative z-10 font-[Space_Grotesk]">Escolha um Desafio</h1>
                    <p className="text-brand-50 relative z-10 max-w-lg">
                      Complete os questionários de cada uma das 6 Metas Internacionais de Segurança do Paciente para testar seus conhecimentos e ganhar moedas da Copa!
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {METAS.map((meta) => {
                      const prog = user.progress[meta.id];
                      const totalCoins = prog?.totalCoinsEarned || 0;
                      const isTreinoLivre = totalCoins >= 150;
                      const isReleased = releasedMetas.includes(meta.id);
                      const canPlay = isReleased || user.isAdmin;

                      return (
                      <button
                        key={meta.id}
                        disabled={!canPlay}
                        onClick={() => handleSelectMeta(meta.id)}
                        className={`group bg-white rounded-2xl p-4 md:p-5 shadow-sm border transition-all flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 text-left relative overflow-hidden ${
                          !canPlay 
                            ? 'bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed' 
                            : 'bg-white border-slate-100 hover:border-brand-300 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white ${meta.color} shadow-sm ${canPlay ? 'group-hover:scale-110' : ''} transition-transform relative`}>
                          {meta.icon}
                          {!isReleased && (
                            <div className="absolute -top-1 -right-1 bg-red-600 border border-white text-white rounded-full p-0.5 shadow-sm">
                              <Lock className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-lg mb-0.5 font-[Space_Grotesk] safe-text">{meta.title}</h3>
                            {!isReleased && (
                              <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none uppercase shrink-0">
                                Bloqueada
                              </span>
                            )}
                            {!isReleased && user.isAdmin && (
                              <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none uppercase shrink-0">
                                Admin Bypass
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm safe-text">{meta.desc}</p>
                        </div>
                        
                        <div className="w-full shrink-0 flex flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-start sm:gap-4">
                          {!isReleased ? (
                            <span className="flex items-center gap-1.5 text-red-600 font-bold text-[11px] sm:text-xs bg-red-50/50 px-2.5 py-1.5 rounded-lg border border-red-100">
                              <Lock className="w-3.5 h-3.5 text-red-500" />
                              Aguardando Liberação
                            </span>
                          ) : isTreinoLivre ? (
                            <span className="flex items-center gap-1.5 text-slate-500 font-bold text-xs sm:text-sm bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              Treino
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs sm:text-sm bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                              Top {totalCoins}/150 <Coins className="w-4 h-4" />
                            </span>
                          )}
                          {canPlay && (
                            <span className="hidden md:flex bg-slate-50 text-brand-600 font-bold text-sm items-center justify-center w-10 h-10 rounded-full group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                              <PlayCircle className="w-6 h-6" />
                            </span>
                          )}
                        </div>
                      </button>
                    )})}
                  </div>
                </>
              ) : isQuizActive ? (
                (() => {
                  const meta = METAS.find(m => m.id === selectedMeta);
                  if (!meta) return null;
                  return (
                    <Quiz 
                      metaId={meta.id}
                      metaTitle={meta.title}
                      metaColor={meta.color}
                      progress={user.progress[meta.id]}
                      onComplete={handleQuizComplete}
                      onAbort={() => stopQuiz('replace')}
                    />
                  );
                })()
              ) : (
                (() => {
                  const meta = METAS.find(m => m.id === selectedMeta);
                  if (!meta) return null;
                  const prog = user.progress[meta.id];
                  const today = new Date().toISOString().split('T')[0];
                  
                  const isTreinoLivre = !!(prog?.totalCoinsEarned && prog.totalCoinsEarned >= 150);
                  const hasPerfected = !!prog?.hasPerfected;
                  const totalAttempts = getMetaAttemptCount(prog);
                  const hasAttemptsRemaining = totalAttempts < 3 && !hasPerfected && !isMetaCompleted(prog);
                  const isAmador = !!(prog?.isAmador || (prog?.totalCoinsEarned && prog.totalCoinsEarned > 0 && prog.lastPlayedDate !== today));
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <button 
                        onClick={handleBackToChallenges}
                        className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold transition-colors mb-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar para Desafios
                      </button>

                      {quizResult && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                          <div>
                            <h3 className="text-xl font-bold text-green-800 mb-1">Partida Finalizada!</h3>
                            <p className="text-green-700 font-medium">Você acertou {quizResult.correct} de 5 perguntas.</p>
                          </div>
                          <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-green-100 text-center">
                            <span className="block text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Moedas Ganhas</span>
                            <span className="text-3xl font-bold text-amber-500 flex items-center justify-center gap-2">
                              +{quizResult.coins} <Coins className="w-6 h-6" />
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        {/* Decorative background slightly tinted with meta's color */}
                        <div className={`absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none ${meta.color}`} />
                        
                        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 relative z-10 items-start">
                          <div className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white ${meta.color} shadow-lg`}>
                            {React.cloneElement(meta.icon, { className: "w-8 h-8 sm:w-10 sm:h-10" })}
                          </div>
                          
                          <div className="w-full">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 font-[Space_Grotesk]">{meta.title}</h2>
                            <h3 className="text-lg sm:text-xl font-medium text-slate-600 mb-4">{meta.desc}</h3>
                            
                            <div className="bg-slate-50 rounded-xl p-5 sm:p-6 border border-slate-100 mb-6 sm:mb-8 inline-block w-full">
                              <p className="text-slate-700 leading-relaxed sm:font-medium text-sm sm:text-base">
                                {meta.fullDesc}
                              </p>
                            </div>

                            {/* Informações de Regras */}
                            <div className="flex flex-col gap-3 mb-6">
                              {isTreinoLivre ? (
                                <div className="bg-slate-100 text-slate-800 rounded-lg p-3 text-sm font-medium flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
                                  Você já atingiu o máximo de moedas nesta meta! O modo Treino Livre gera habilidade, mas não novas moedas.
                                </div>
                              ) : hasPerfected ? (
                                <div className="bg-green-50 text-green-800 rounded-lg p-3 text-sm font-medium flex items-center gap-2">
                                  <Trophy className="w-5 h-5 text-green-600 shrink-0" />
                                  Excelente! Você completou esta meta com perfeição na primeira tentativa.
                                </div>
                              ) : totalAttempts >= 3 ? (
                                <div className="bg-red-50 text-red-800 rounded-lg p-3 text-sm font-medium flex items-center gap-2">
                                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                                  Você esgotou suas tentativas totais nesta meta.
                                </div>
                              ) : (
                                <div className="bg-amber-50 text-amber-800 rounded-lg p-3 text-sm font-medium flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                                  {totalAttempts === 0 
                                    ? 'Modo Chute de Primeira Ativo: Bônus máximo liberado! Faça de primeira para multiplicar suas moedas.'
                                    : `Você tem ${3 - totalAttempts} chance(s) restante(s) para melhorar seu saldo nesta meta.`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 relative z-10">
                          <button 
                            onClick={() => handleOpenStudyMaterial(meta.id)}
                            className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 py-4 px-4 sm:px-6 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-3 transition-colors shadow-sm text-center"
                          >
                            <BookOpen className="w-6 h-6 text-brand-500 shrink-0" />
                            Material de Estudo
                          </button>
                          
                          <button 
                            disabled={!hasAttemptsRemaining && !isTreinoLivre}
                            onClick={startQuiz}
                            className={`py-4 px-4 sm:px-6 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-3 transition-colors shadow-sm text-center border-2 ${
                              (!hasAttemptsRemaining && !isTreinoLivre) ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600'
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <PlayCircle className="w-6 h-6 shrink-0" />
                              {(!hasAttemptsRemaining && !isTreinoLivre) ? 'Tentativas Esgotadas Hoje' : isTreinoLivre ? 'Modo Treino Livre' : 'Iniciar Quiz (20s p/ questão)'}
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()
              )}
            </motion.div>
          )}

          {activeTab === 'loja' && (
            <motion.div
              key="loja"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Suspense fallback={<LazyPanelFallback />}>
                <Store coins={user.coins} onBuyPack={onBuyPack} />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'album' && (
            <motion.div
               key="album"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="bg-[#fdfcf8] rounded-r-3xl rounded-l-md p-6 sm:p-8 shadow-[inset_10px_0_20px_rgba(0,0,0,0.03),0_10px_30px_rgba(0,0,0,0.08)] border-y-[6px] border-r-[6px] border-l-[20px] border-slate-200 flex flex-col min-h-[600px] relative overflow-hidden"
            >
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-slate-300/30 to-transparent pointer-events-none z-10" />
              
              <div className="text-center mb-8 relative z-20">
                <LayoutGrid className="w-16 h-16 text-brand-300 mx-auto mb-4 drop-shadow-sm" />
                <h2 className="text-3xl font-bold text-slate-800 mb-2 font-[Space_Grotesk]">Álbum de Figurinhas</h2>
                <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 mt-2">
                  <span className="text-brand-600 font-bold text-lg">{user.stickers.length} / {allStickersCatalog.length}</span>
                  <span className="text-slate-500 text-sm font-medium">figurinhas coladas</span>
                </div>
              </div>

              <div className="relative max-w-md mx-auto w-full mb-10 z-20">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar figurinhas por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-slate-200 rounded-2xl bg-white text-slate-900 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-sm"
                />
              </div>
              
              <div className="flex flex-col gap-12 z-20 relative w-full">
                {groupedStickers.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-slate-500 font-medium">Nenhuma figurinha encontrada para "{searchQuery}".</p>
                  </div>
                ) : (
                  groupedStickers.map((group, groupIdx) => (
                    <div key={groupIdx} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                      {/* Page Header */}
                      <div className={`bg-gradient-to-r ${group.color} px-6 sm:px-8 py-5 flex justify-between items-center text-white relative overflow-hidden border-b-4 border-black/10`}>
                        <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>
                        <h3 className="text-2xl sm:text-3xl font-black font-[Space_Grotesk] tracking-wider uppercase drop-shadow-md relative z-10">{group.title}</h3>
                        <div className="bg-white/20 px-4 py-1.5 rounded-full text-base font-bold backdrop-blur-md shadow-inner hidden sm:block relative z-10 border border-white/30">
                           {group.stickers.filter(s => user.stickers.includes(s.id)).length} / {group.stickers.length}
                        </div>
                      </div>
                      
                      {/* Page Grid */}
                      <div className="p-6 sm:p-10 bg-[#fdfcf8] relative">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #000 1px, transparent 1px), radial-gradient(circle at 0 0, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 lg:gap-10 justify-items-center relative z-10">
                          {group.stickers.map((sticker, i) => {
                            const hasSticker = user.stickers.includes(sticker.id);
                            if (hasSticker) {
                              return (
                                <div key={`${sticker.id}-${i}`} onClick={() => setZoomedSticker(sticker)} className={`w-full aspect-[2.5/3.5] max-w-[140px] rounded-xl flex flex-col items-center justify-center p-1.5 text-center border-[5px] shadow-sm relative overflow-hidden group transition-all hover:scale-105 hover:shadow-xl hover:z-10 focus:z-10 cursor-pointer ${sticker.rarity === 'suprema' ? 'bg-yellow-400 border-yellow-300 text-yellow-950' : sticker.rarity === 'lendaria' ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : sticker.rarity === 'holografica' ? 'bg-cyan-400 border-cyan-300 text-cyan-950' : 'bg-white border-slate-100 text-slate-800'}`}>
                                  {sticker.rarity !== 'regular' && (
                                    <div className="absolute top-0 bottom-0 left-0 w-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[60%] group-hover:animate-shimmer pointer-events-none" />
                                  )}
                                  <StickerImage id={sticker.id} name={sticker.name} customImage={sticker.image} />
                                  <div className="mt-auto bg-slate-100/80 w-[#110%] -mx-[5%] py-1.5 relative left-1/2 -translate-x-1/2">
                                     <span className="font-bold text-[8px] uppercase tracking-widest opacity-90 block leading-tight text-slate-800 mb-0.5">{sticker.rarity}</span>
                                     <h4 className="font-bold text-[10px] leading-tight font-[Space_Grotesk] line-clamp-2 text-slate-800 px-2">{sticker.name}</h4>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div 
                                  key={`${sticker.id}-${i}`} 
                                  className={`w-full aspect-[2.5/3.5] max-w-[140px] flex flex-col items-center justify-center p-1 text-center relative overflow-hidden border-2 ${group.bgColor} select-none opacity-80`}
                                  title={`${sticker.name} (Ainda não adquirida)`}
                                >
                                  <div className="absolute inset-x-0 inset-y-0 bg-white/10"></div>
                                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                       <span className={`text-[80px] xs:text-[100px] leading-none font-black font-[Space_Grotesk] tracking-tight select-none ${group.numColor}`}>{sticker.id}</span>
                                  </div>
                                  <div className="mt-auto mb-2 relative z-10 w-full px-1.5">
                                       <div className="bg-white/90 py-1.5 rounded-sm backdrop-blur-xs shadow-xs flex flex-col items-center justify-center">
                                         <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-500 line-clamp-1 safe-text block px-1">{sticker.name}</span>
                                       </div>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {zoomedSticker && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setZoomedSticker(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setZoomedSticker(null)} 
                    className="absolute -top-3 -right-3 bg-white hover:bg-slate-100 rounded-full p-2 shadow-md border border-slate-200"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                  <StickerImage id={zoomedSticker.id} name={zoomedSticker.name} customImage={zoomedSticker.image} className="!max-h-[300px] !w-auto mx-auto" />
                  <h4 className="font-bold text-center text-xl mt-4 text-slate-800">{zoomedSticker.name}</h4>
                  <p className="text-center text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Raridade: {zoomedSticker.rarity}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'trocas' && (
            <motion.div
               key="trocas"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
            >
              <Suspense fallback={<LazyPanelFallback />}>
                <Trading user={user} onTradeComplete={onTradeComplete} onUserUpdate={onUpdateUser} initialMode={tradingInitialMode} />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[400px]"
            >
              <div className="bg-brand-600 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500 blur-3xl opacity-50 pointer-events-none" />
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 relative z-10 font-[Space_Grotesk] flex items-center gap-3">
                  <Crown className="w-8 h-8 text-amber-300" />
                  Ranking HUSF
                </h1>
                <p className="text-brand-50 relative z-10">Confira a classificação dos colaboradores e setores do hospital. Exibição otimizada com Top 100 para melhor desempenho.</p>
              </div>

              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setRankingTab('individual')}
                  className={`flex-1 py-4 font-bold text-sm sm:text-base border-b-2 transition-colors ${rankingTab === 'individual' ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  Ranking Individual
                </button>
                <button
                  onClick={() => setRankingTab('setores')}
                  className={`flex-1 py-4 font-bold text-sm sm:text-base border-b-2 transition-colors ${rankingTab === 'setores' ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  Ranking de Setores
                </button>
              </div>
              
              <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                {rankingTab === 'individual' ? (
                  <div className="space-y-4">
                    <details className="group bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-900 overflow-hidden">
                      <summary className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer select-none list-none">
                        <Zap className="w-5 h-5 text-brand-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-black">Ver critérios do ranking individual</p>
                          <p className="text-brand-700 text-xs sm:text-sm mt-0.5">Clique aqui para entender como a classificação é calculada.</p>
                        </div>
                        <span className="text-xs font-black text-brand-700 bg-white/80 border border-brand-100 rounded-full px-3 py-1 group-open:hidden">
                          Abrir
                        </span>
                        <span className="hidden text-xs font-black text-brand-700 bg-white/80 border border-brand-100 rounded-full px-3 py-1 group-open:inline-flex">
                          Fechar
                        </span>
                      </summary>
                      <div className="border-t border-brand-100 px-3 pb-3 sm:px-4 sm:pb-4 text-brand-700 text-xs sm:text-sm leading-relaxed">
                        <p>
                          Ordem: 1º pontuação oficial dos quizzes, 2º total de pontos, 3º metas concluídas, 4º metas respondidas, 5º acertos, 6º menor tempo total gasto nas metas quando os dois têm tempo registrado, 7º nome e CPF.
                        </p>
                        <p className="mt-2">
                          Como o cronômetro é regressivo de 20s, o sistema converte para tempo gasto: respondeu com 14s restantes = gastou 6s; tempo esgotado = 20s. Carteira e figurinhas não alteram a colocação.
                        </p>
                      </div>
                    </details>

                    <div className="flex flex-col gap-3">
                      {visibleIndividualRanking.map((rankedUser, index) => (
                        <div key={rankedUser.cpf} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border ${index === 0 ? 'bg-amber-50 border-amber-200' : index === 1 ? 'bg-slate-50 border-slate-200' : index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-lg rounded-full shrink-0 ${index === 0 ? 'bg-amber-400 text-white shadow-md' : index === 1 ? 'bg-slate-300 text-slate-700 shadow-sm' : index === 2 ? 'bg-orange-300 text-orange-800 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border border-brand-200">
                            {rankedUser.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 safe-text text-sm sm:text-base">{rankedUser.name}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 safe-text">{rankedUser.sector}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] sm:text-xs text-slate-500">
                              <span>Pontos: <strong>{rankedUser.engagement.totalQuizCoins}</strong>/{rankedUser.engagement.maxQuizCoins}</span>
                              <span className="text-slate-300">•</span>
                              <span>Pontuação oficial: <strong>{rankedUser.engagement.rankingScore}%</strong></span>
                              <span className="text-slate-300">•</span>
                              <span>Metas concluídas: <strong>{rankedUser.engagement.metasConcluidas}</strong>/{rankedUser.engagement.totalMetas}</span>
                              <span className="text-slate-300">•</span>
                              <span>Metas respondidas: <strong>{rankedUser.engagement.metasParticipadas}</strong>/{rankedUser.engagement.totalMetas}</span>
                              <span className="text-slate-300">•</span>
                              <span>Acertos registrados: <strong>{rankedUser.engagement.totalCorrectAnswers}</strong>/{rankedUser.engagement.totalQuestionsAnswered || 0}</span>
                              <span className="text-slate-300">•</span>
                              <span>Tempo total gasto: <strong>{rankedUser.engagement.hasSpeedData ? rankedUser.engagement.officialTotalResponseTimeLabel : 'sem tempo novo'}</strong></span>
                              <span className="text-slate-300">•</span>
                              <span>Tempo médio: <strong>{rankedUser.engagement.hasSpeedData ? rankedUser.engagement.officialAverageResponseTimeLabel : 'sem tempo novo'}</strong></span>
                              <span className="text-slate-300">•</span>
                              <span>Carteira: <strong>{rankedUser.coins}</strong> moedas</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {rankedUser.engagement.metaBreakdown.map(metaStatus => (
                                <span
                                  key={metaStatus.id}
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                                    metaStatus.completed
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : metaStatus.answered
                                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                                        : 'border-slate-200 bg-slate-50 text-slate-400'
                                  }`}
                                  title={`${metaStatus.title} - ${metaStatus.completed ? 'feita' : metaStatus.answered ? 'em andamento' : 'pendente'}`}
                                >
                                  M{metaStatus.id} {metaStatus.completed ? '✓' : metaStatus.answered ? '•' : '-'}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-600 rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(0, rankedUser.engagement.rankingScore))}%` }}
                              />
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1 font-black text-brand-700 bg-brand-50 px-2 sm:px-3 py-1 rounded-lg border border-brand-100 text-sm sm:text-base">
                              {rankedUser.engagement.rankingScore}% <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
                            </div>
                            <span className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">
                              Pontuação oficial
                            </span>
                            {user.isAdmin && (
                              <button
                                type="button"
                                onClick={() => setAdminViewedUserCpf(rankedUser.cpf)}
                                className="mt-1 rounded-lg border border-brand-100 bg-white px-2 py-1 text-[10px] font-black text-brand-700 hover:bg-brand-50 transition-all"
                              >
                                Ver perfil
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Metric selector toggle - Only visible to admin */}
                    {user.isAdmin && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 sm:px-4 sm:py-3 rounded-xl border border-slate-200/60 mb-1">
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                            Opções de Administrador (Critério de Classificação)
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Selecione como quer analisar: por pontuação oficial média dos quizzes ou apenas por moedas disponíveis na carteira.
                          </span>
                        </div>
                        <div className="flex bg-slate-200/60 p-1 rounded-lg self-start sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => setSectorRankingMetric('average')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sectorRankingMetric === 'average' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            Pontuação oficial %
                          </button>
                          <button
                            type="button"
                            onClick={() => setSectorRankingMetric('total')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${sectorRankingMetric === 'total' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            Moedas na Carteira
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {visibleSectorRanking.map((sector, index) => {
                        const showTotalWalletCoins = user.isAdmin && sectorRankingMetric === 'total';
                        return (
                          <div key={sector.name} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border ${index === 0 ? 'bg-amber-50/70 border-amber-200' : index === 1 ? 'bg-slate-50/70 border-slate-200' : index === 2 ? 'bg-orange-50/70 border-orange-200' : 'bg-white border-slate-100'}`}>
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-lg rounded-full shrink-0 ${index === 0 ? 'bg-amber-400 text-white shadow-md' : index === 1 ? 'bg-slate-300 text-slate-700 shadow-sm' : index === 2 ? 'bg-orange-300 text-orange-850 shadow-sm' : 'bg-slate-105 text-slate-500 border border-slate-200 bg-slate-50'}`}>
                              {index + 1}
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border border-indigo-100">
                              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-800 safe-text text-sm sm:text-base">{sector.name}</h3>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                                <span><strong>{sector.memberCount}</strong> {sector.memberCount === 1 ? 'membro' : 'membros'}</span>
                                <span className="text-slate-300">•</span>
                                <span>Pontuação oficial: <strong>{sector.score}%</strong></span>
                                <span className="text-slate-300">•</span>
                                <span>Pontos quizzes: <strong>{sector.totalQuizCoins}</strong></span>
                                <span className="text-slate-300">•</span>
                                <span>Metas completas: <strong>{sector.totalMetasConcluidas}</strong>/{sector.totalMetas}</span>
                                <span className="text-slate-300">•</span>
                                <span>Metas respondidas: <strong>{sector.totalMetasParticipadas}</strong>/{sector.totalMetas}</span>
                                {user.isAdmin && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span>Acertos: <strong>{sector.totalCorrectAnswers}</strong>/{sector.totalQuestionsAnswered}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>Tempo total gasto: <strong>{sector.totalOfficialResponseTimeMs ? sector.officialTotalResponseTimeLabel : 'sem tempo novo'}</strong></span>
                                    <span className="text-slate-300">•</span>
                                    <span>Tempo médio: <strong>{sector.averageResponseTimeMs ? sector.averageResponseTimeLabel : 'sem tempo novo'}</strong></span>
                                    <span className="text-slate-300">•</span>
                                    <span className={showTotalWalletCoins ? 'text-brand-750 font-bold' : ''}>
                                      Na carteira: <strong>{sector.totalCoins}</strong> moedas
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1 font-bold text-amber-605 bg-amber-50/80 px-2 sm:px-3 py-1 rounded-lg border border-amber-200/60 text-sm sm:text-base">
                                {showTotalWalletCoins ? (
                                  <>
                                    {sector.totalCoins} <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                                  </>
                                ) : (
                                  <>
                                    {sector.score}%
                                  </>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">
                                {showTotalWalletCoins ? 'Carteira' : 'Pontuação oficial'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="bg-brand-600 p-8 text-white relative overflow-hidden flex flex-col items-center border-b border-brand-500 text-center">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500 blur-3xl opacity-50 pointer-events-none" />
                
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-4xl sm:text-5xl border-4 border-white shadow-lg mb-4 relative z-10">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-[Space_Grotesk] uppercase relative z-10">{user.name}</h2>
                <p className="text-brand-100 font-medium relative z-10 mt-1">{user.sector}</p>
                <p className="text-sm text-brand-200 mt-1 mb-4 relative z-10 bg-brand-700/50 px-3 py-1 rounded-full">CPF: {user.cpf}</p>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <Coins className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Moedas Copas</p>
                      <p className="text-3xl font-bold text-slate-800">{user.coins}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <LayoutGrid className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Figurinhas Obtidas</p>
                      <p className="text-3xl font-bold text-slate-800">{user.stickers.length}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <Zap className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Engajamento</p>
                      <p className="text-3xl font-bold text-slate-800">{calculateUserEngagement(user).aproveitamento}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-800 font-[Space_Grotesk] flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Histórico de pontos e ações
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Transparência total das moedas, quizzes, compras e figurinhas.</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                      Últimos registros
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200 bg-white">
                    {currentUserActivity.length > 0 ? currentUserActivity.map((entry) => (
                      <div key={entry.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0 ${getActivityBadgeClass(entry.type)}`}>
                          {getActivityTypeLabel(entry.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{entry.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{entry.description}</p>
                            </div>
                            <div className="shrink-0 text-left sm:text-right">
                              {typeof entry.points === 'number' && entry.points !== 0 && (
                                <p className={`font-black text-sm ${entry.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {entry.points > 0 ? '+' : ''}{entry.points} moedas
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatActivityTime(entry.createdAt)}</p>
                            </div>
                          </div>
                          {typeof entry.coinsAfter === 'number' && (
                            <p className="text-[10px] text-slate-400 font-semibold mt-2">
                              Saldo após ação: <strong className="text-slate-600">{entry.coinsAfter}</strong> moedas
                            </p>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        Nenhuma atividade registrada ainda. Quando você responder quizzes, comprar pacotes ou receber recompensas, tudo aparecerá aqui.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && user.isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header Box */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-purple-500 blur-3xl opacity-30 pointer-events-none" />
                <div className="relative z-10">
                  <span className="bg-purple-900/50 backdrop-blur-md text-purple-200 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-flex items-center gap-1.5 leading-none">
                    <ShieldCheck className="w-4 h-4 text-purple-300" />
                    Ambiente de Controle
                  </span>
                  <h1 className="text-3xl font-black font-[Space_Grotesk] tracking-tight mb-2">Painel de Gestão da Copa da Segurança</h1>
                  <p className="text-purple-100 max-w-2xl leading-relaxed text-sm">
                    Organize colaboradores, metas, figurinhas, recompensas e acompanhamento em tempo real em um painel mais limpo e profissional.
                  </p>
                </div>
              </div>

              {/* Alerta Educacional de Sincronização */}
              {!isSupabaseConfigured ? (
                <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                    <WifiOff className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm sm:text-base font-[Space_Grotesk]">Aviso de Sincronização: Rodando em Modo Local (Offline)</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Atualmente o aplicativo está rodando em <strong>Modo Local (Offline)</strong> porque o banco de dados em nuvem Supabase não foi configurado. 
                      Isso causa a <strong>divergência</strong> que você notou: os colaboradores cadastrados por você neste navegador <strong>ficam guardados apenas no cache deste PC</strong> e por isso não aparecem quando você abre o link no celular!
                    </p>
                    <div className="mt-3 bg-white p-3 rounded-lg border border-amber-200 text-[11px] text-slate-500 font-semibold space-y-1">
                      <p className="text-amber-900 font-bold">Como resolver e habilitar a sincronização automática em tempo real:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Abra a aba <strong>Settings (Configurações)</strong> na barra lateral esquerda da sua plataforma AI Studio.</li>
                        <li>Clique na seção de <strong>Secrets (Segredos)</strong>.</li>
                        <li>Adicione as duas variáveis: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-purple-700">VITE_SUPABASE_URL</code> e <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-purple-700">VITE_SUPABASE_ANON_KEY</code> com as credenciais do seu projeto Supabase.</li>
                        <li>Com as variáveis salvas, todo cadastro feito no PC aparecerá instantaneamente no Celular!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : lastSupabaseError ? (
                <div className="bg-rose-50 border-2 border-dashed border-rose-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-900 text-sm sm:text-base font-[Space_Grotesk]">Erro de Conexão com o Supabase</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Suas credenciais do Supabase foram inseridas corretamente em <strong>Secrets</strong>, mas o banco de dados retornou o seguinte erro:
                    </p>
                    <div className="mt-2 bg-rose-100/50 p-3 rounded-lg border border-rose-200 text-[11px] font-mono text-rose-800 leading-snug">
                      {lastSupabaseError}
                    </div>
                    {lastSupabaseError.toLowerCase().includes('relation') || lastSupabaseError.toLowerCase().includes('does not exist') ? (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 font-medium space-y-1">
                        <p className="text-rose-950 font-bold">Causa provável: As tabelas não existem.</p>
                        <p className="leading-relaxed">
                          Você precisa criar as tabelas do banco de dados no painel do Supabase. Copie o script SQL disponível em <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-purple-700">src/lib/supabase.ts</code> (no topo do arquivo) e cole-o no menu <strong>SQL Editor</strong> do seu painel do Supabase, depois clique em <strong>Run</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 font-medium space-y-1">
                        <p className="text-slate-800 font-bold">Como resolver:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Abra o Supabase e confira se o projeto não está pausado/inativo. Em plano gratuito, o primeiro acesso pode demorar; esta versão espera mais tempo antes de cair no cache local.</li>
                          <li>Confirme se a URL e a Anon Key estão corretas, sem espaços extras, e reinicie o Dev Server do AI Studio.</li>
                          <li>Rode novamente os scripts SQL de criação/correção das tabelas e do realtime.</li>
                          <li>Evite salvar imagens base64 pesadas no banco; use caminhos como <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-purple-700">/assets/images/sticker_1.webp</code>.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight">Colaboradores</span>
                    <UserCheck className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 font-[Space_Grotesk]">{usersList.length}</p>
                  <p className="text-[10px] text-indigo-500 font-semibold">Base ativa carregada</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight">Moedas Totais</span>
                    <Coins className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 font-[Space_Grotesk]">
                    {usersList.reduce((acc, u) => acc + u.coins, 0) + (user.cpf !== '136.832.356-16' ? user.coins : 0)}
                  </p>
                  <p className="text-[10px] text-amber-500 font-semibold">Moedas na economia</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight">Setores Ativos</span>
                    <Building2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 font-[Space_Grotesk]">
                    {new Set(usersList.map(u => u.sector)).size}
                  </p>
                  <p className="text-[10px] text-emerald-500 font-semibold">Departamentos monitorados</p>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl shadow-sm border space-y-1 ${isSupabaseConfigured ? 'bg-emerald-50/25 border-emerald-100' : 'bg-amber-50/20 border-amber-100'}`}>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight">Banco de Dados</span>
                    {isSupabaseConfigured ? (
                      <Wifi className="w-4.5 h-4.5 text-emerald-500" />
                    ) : (
                      <WifiOff className="w-4.5 h-4.5 text-amber-500" />
                    )}
                  </div>
                  <p className={`text-2xl font-black font-[Space_Grotesk] ${isSupabaseConfigured ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isSupabaseConfigured ? 'Nuvem Sync' : 'Offline'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isSupabaseConfigured ? 'Dados em tempo real' : 'Local (este navegador)'}
                  </p>
                </div>
              </div>

              {/* Navegação organizada do painel admin */}
              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 grid grid-cols-2 lg:grid-cols-5 gap-2">
                {[
                  { id: 'overview', label: 'Visão geral', sub: 'Resumo', icon: <Home className="w-4 h-4" /> },
                  { id: 'colaboradores', label: 'Colaboradores', sub: 'Cadastro e ações', icon: <UserPlus className="w-4 h-4" /> },
                  { id: 'metas', label: 'Metas', sub: 'Liberação', icon: <ShieldCheck className="w-4 h-4" /> },
                  { id: 'figurinhas', label: 'Figurinhas', sub: 'Álbum', icon: <Trophy className="w-4 h-4" /> },
                  { id: 'monitoramento', label: 'Monitoramento', sub: 'Auditoria', icon: <CheckCircle2 className="w-4 h-4" /> },
                ].map((item) => {
                  const isActive = adminSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAdminSectionChange(item.id as AdminSection)}
                      className={`rounded-2xl p-3 sm:p-4 text-left transition-all border flex items-center gap-2 sm:gap-3 cursor-pointer active:scale-[0.98] ${
                        isActive
                          ? 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border-amber-300/60 shadow-md'
                          : 'bg-slate-50/70 hover:bg-white text-slate-600 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-white text-emerald-700 border border-slate-100'}`}>
                        {item.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] sm:text-sm font-extrabold font-[Space_Grotesk] leading-tight safe-text">{item.label}</span>
                        <span className={`block text-[9px] sm:text-[10px] font-bold leading-tight safe-text ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>{item.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {adminSection === 'overview' && (
                <div className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-amber-300/20 relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl" />
                    <div className="absolute right-6 bottom-6 opacity-10">
                      <Trophy className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-5">
                      <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> Central do Administrador
                      </span>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black font-[Space_Grotesk] tracking-tight">Gestão organizada da competição</h2>
                        <p className="text-sm text-slate-200 mt-2 max-w-xl leading-relaxed">
                          Use os atalhos abaixo para cadastrar colaboradores, liberar metas, ajustar figurinhas e acompanhar o andamento da Copa da Segurança sem precisar rolar uma tela muito longa.
                        </p>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <button onClick={() => handleAdminSectionChange('colaboradores')} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 text-left transition-all cursor-pointer active:scale-95">
                          <UserPlus className="w-5 h-5 text-amber-300 mb-2" />
                          <p className="font-extrabold text-sm">Equipe</p>
                          <p className="text-[11px] text-slate-300">Cadastrar e premiar</p>
                        </button>
                        <button onClick={() => handleAdminSectionChange('metas')} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 text-left transition-all cursor-pointer active:scale-95">
                          <ShieldCheck className="w-5 h-5 text-emerald-300 mb-2" />
                          <p className="font-extrabold text-sm">Metas</p>
                          <p className="text-[11px] text-slate-300">{releasedMetas.length}/{METAS.length} liberadas</p>
                        </button>
                        <button onClick={() => handleAdminSectionChange('figurinhas')} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 text-left transition-all cursor-pointer active:scale-95">
                          <Trophy className="w-5 h-5 text-amber-300 mb-2" />
                          <p className="font-extrabold text-sm">Álbum</p>
                          <p className="text-[11px] text-slate-300">{allStickersCatalog.length} figurinhas</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-black text-slate-800 font-[Space_Grotesk]">Status rápido</h3>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {isSupabaseConfigured ? 'Online' : 'Local'}
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                        <span className="text-slate-500 font-bold">Colaboradores</span>
                        <span className="font-black text-slate-900">{usersList.length}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                        <span className="text-slate-500 font-bold">Setores</span>
                        <span className="font-black text-slate-900">{new Set(usersList.map(u => u.sector)).size}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                        <span className="text-slate-500 font-bold">Metas liberadas</span>
                        <span className="font-black text-emerald-700">{releasedMetas.length}/{METAS.length}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                        <span className="text-slate-500 font-bold">Figurinhas</span>
                        <span className="font-black text-amber-600">{allStickersCatalog.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
                    <div>
                      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-2">
                        <Zap className="w-3.5 h-3.5" /> Relatório de engajamento
                      </span>
                      <h3 className="font-black text-slate-900 text-xl sm:text-2xl font-[Space_Grotesk]">Saúde da campanha</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        Veja rapidamente quem está participando, quais metas performam melhor e onde o admin precisa agir.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdminSectionChange('monitoramento')}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wide shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      Abrir monitoramento <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-2xl p-4 border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Engajamento médio</span>
                        <Trophy className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-3xl font-black text-slate-900 font-[Space_Grotesk]">{adminEngagementReport.averageEngagement}%</p>
                      <div className="h-2 bg-emerald-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, adminEngagementReport.averageEngagement)}%` }} />
                      </div>
                    </div>

                    <div className="rounded-2xl p-4 border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Ativos na semana</span>
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-3xl font-black text-slate-900 font-[Space_Grotesk]">{adminEngagementReport.activeThisWeek}/{adminEngagementReport.totalCollaborators}</p>
                      <p className="text-[11px] text-blue-700 font-bold mt-2">{adminEngagementReport.activeRate}% da base movimentou o app</p>
                    </div>

                    <div className="rounded-2xl p-4 border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Setor destaque</span>
                        <Building2 className="w-5 h-5 text-amber-600" />
                      </div>
                      <p className="text-lg font-black text-slate-900 font-[Space_Grotesk] safe-text">{adminEngagementReport.topSector?.sector || 'Sem setor'}</p>
                      <p className="text-[11px] text-amber-700 font-bold mt-2">{adminEngagementReport.topSector?.averageEngagement || 0}% de engajamento médio</p>
                    </div>

                    <div className="rounded-2xl p-4 border border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Destaque individual</span>
                        <Crown className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-lg font-black text-slate-900 font-[Space_Grotesk] safe-text">{adminEngagementReport.topCollaborator?.name || 'Sem dados'}</p>
                      <p className="text-[11px] text-purple-700 font-bold mt-2">{adminEngagementReport.topCollaborator?.engagement.aproveitamento || 0}% • {adminEngagementReport.topCollaborator?.engagement.totalQuizCoins || 0} pontos</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-black text-slate-800 text-sm font-[Space_Grotesk]">Participação por meta</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Mostra quais temas precisam de reforço.</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400">6 metas</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {adminEngagementReport.metaReports.map((item) => (
                          <div key={item.meta.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-slate-800 text-sm safe-text">{item.meta.title} — {item.meta.desc}</p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.participants} participantes • {item.completed} concluíram • {item.totalCoins} pontos</p>
                            </div>
                            <div className="sm:w-40">
                              <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1">
                                <span>Engajamento</span>
                                <span>{item.engagementRate}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, item.engagementRate)}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/60 space-y-3">
                      <h4 className="font-black text-slate-800 text-sm font-[Space_Grotesk] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500" /> Pontos de atenção
                      </h4>
                      <div className="bg-white rounded-2xl p-3 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meta com menor adesão</p>
                        <p className="font-black text-slate-800 text-sm mt-1">{adminEngagementReport.attentionMeta ? `${adminEngagementReport.attentionMeta.meta.title}: ${adminEngagementReport.attentionMeta.meta.desc}` : 'Sem dados'}</p>
                        <p className="text-[11px] text-rose-600 font-bold mt-1">{adminEngagementReport.attentionMeta?.engagementRate || 0}% de engajamento</p>
                      </div>
                      <div className="bg-white rounded-2xl p-3 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Setor para reforçar</p>
                        <p className="font-black text-slate-800 text-sm mt-1 safe-text">{adminEngagementReport.lowSector?.sector || 'Sem dados'}</p>
                        <p className="text-[11px] text-amber-700 font-bold mt-1">{adminEngagementReport.lowSector?.averageEngagement || 0}% de engajamento médio</p>
                      </div>
                      <div className="bg-white rounded-2xl p-3 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Colaboradores em alerta</p>
                        <p className="font-black text-slate-800 text-sm mt-1">{adminEngagementReport.riskCollaborators.length}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Com baixo engajamento ou sem atividade recente.</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}

              {adminSection === 'colaboradores' && (
                <>
              {/* Audit Tools & Simulation */}
              <div className="grid md:grid-cols-5 gap-6">
                
                {/* Registrador de Colaboradores (Individual ou em Massa) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 md:col-span-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800 text-lg font-[Space_Grotesk] flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-purple-600" />
                        Cadastrar Colaborador do Hospital
                      </h3>
                      <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-extrabold uppercase">Gerenciamento</span>
                    </div>

                    {/* Selector de modo de Cadastro */}
                    <div className="flex bg-slate-100/80 p-1 rounded-xl mb-4">
                      <button
                        type="button"
                        onClick={() => { setRegMode('individual'); setBulkSummary(null); }}
                        className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${regMode === 'individual' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Cadastro Único
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRegMode('massa'); setBulkSummary(null); }}
                        className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${regMode === 'massa' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        📋 Registro em Massa (Excel/Texto)
                      </button>
                    </div>

                    {regMode === 'individual' ? (
                      <div>
                        <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                          Preencha os dados do colaborador para registrá-lo na base de usuários autorizados do HUSF. Ele obterá <span className="font-bold text-amber-600">30 moedas iniciais</span> para começar a abrir seus primeiros pacotes.
                        </p>

                        <form onSubmit={handleRegisterCollaborator} className="space-y-4">
                          {/* Name input */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome Completo do Colaborador</label>
                            <input 
                              type="text" 
                              placeholder="Ex: Dra. Mariana Ramos ou Técnico Carlos"
                              value={newRegName}
                              onChange={(e) => setNewRegName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white font-medium transition-colors"
                              required
                            />
                          </div>

                          {/* CPF and sector container */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-medium">CPF (Login do Usuário)</label>
                              <input 
                                type="text" 
                                placeholder="000.000.000-00"
                                maxLength={14}
                                value={newRegCpf}
                                onChange={(e) => {
                                  const masked = formatCPF(e.target.value);
                                  setNewRegCpf(masked);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white font-mono tracking-wider transition-colors"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-medium">Setor Principal</label>
                              <select 
                                value={newRegSector}
                                onChange={(e) => setNewRegSector(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white font-medium transition-colors cursor-pointer"
                              >
                                <option value="UTI Adulto">UTI Adulto</option>
                                <option value="UTI Neonatal">UTI Neonatal</option>
                                <option value="Pronto Socorro">Pronto Socorro</option>
                                <option value="Centro Cirúrgico">Centro Cirúrgico</option>
                                <option value="Clínica Médica">Clínica Médica</option>
                                <option value="Higienização / Limpeza">Higienização / Limpeza</option>
                                <option value="Diretoria de Qualidade">Diretoria de Qualidade</option>
                                <option value="Farmácia Hospitalar">Farmácia Hospitalar</option>
                                <option value="Pediatria">Pediatria</option>
                                <option value="Radiologia">Radiologia</option>
                                <option value="Outro Setor">Outro Setor...</option>
                              </select>
                            </div>
                          </div>

                          {/* Fallback Custom Sector Input if select "Outro Setor" */}
                          {newRegSector === 'Outro Setor' && (
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-medium">Especifique o Setor Personalizado</label>
                              <input
                                type="text"
                                placeholder="Nome do departamento, ex: Laboratório Clínico"
                                onChange={(e) => setNewRegSector(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white font-medium transition-colors"
                                required
                              />
                            </div>
                          )}

                          {/* Display warning or successes */}
                          {newRegError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs shadow-2xs">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{newRegError}</span>
                            </div>
                          )}

                          {newRegSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-xs shadow-2xs">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                              <span>{newRegSuccess}</span>
                            </div>
                          )}

                          {/* Form action */}
                          <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl shadow-xs hover:from-purple-700 hover:to-indigo-800 transition-all hover:shadow-xs cursor-pointer active:scale-95"
                          >
                            Registrar na Base HUSF
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Adicione múltiplos colaboradores de uma só vez! Cole dados vindos do <strong>Excel</strong>, <strong>Google Sheets</strong> ou de um arquivo de texto. Cada funcionário deve estar em sua própria linha no padrão:
                        </p>

                        <div className="bg-purple-50/60 border border-purple-150 p-3 rounded-xl text-[11px] text-purple-950 font-medium">
                          <strong>Padrão suportado:</strong> <code className="bg-white px-1 py-0.5 border border-purple-100 rounded text-purple-800 font-bold font-mono">CPF ; Nome ; Setor</code>
                          <pre className="mt-2 font-mono text-[10px] text-purple-900 bg-white/70 p-2 rounded-lg select-all border border-purple-100 overflow-x-auto">
                            {"111.111.111-11 ; Dra. Laura Albuquerque ; UTI Neonatal\n222.222.222-22 ; Fernando Lima ; Pronto Socorro\n333.333.333-33 ; Patrícia Santos ; Farmácia Hospitalar"}
                          </pre>
                          <p className="mt-2 text-[10px] text-purple-600/90 leading-normal">
                            💡 O CPF pode ser inserido tanto com pontos/hífen quanto apenas os 11 dígitos numéricos (o sistema formatará automaticamente!). Caso o Setor não seja informado, será classificado como "Outro Setor".
                          </p>
                        </div>

                        <form onSubmit={handleBulkRegister} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dados para Processamento</label>
                            <textarea
                              rows={5}
                              placeholder="CPF;Nome;Setor&#13;CPF;Nome;Setor..."
                              value={bulkText}
                              onChange={(e) => setBulkText(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-850 font-mono leading-relaxed focus:outline-none focus:border-purple-500 focus:bg-white transition-colors resize-y min-h-[140px]"
                            />
                          </div>

                          {bulkError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{bulkError}</span>
                            </div>
                          )}

                          {bulkSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-xs">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                              <span>{bulkSuccess}</span>
                            </div>
                          )}

                          <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl shadow-xs hover:from-purple-700 hover:to-indigo-800 transition-all hover:shadow-xs cursor-pointer active:scale-95"
                          >
                            Importar Linhas e Cadastrar Todos
                          </button>
                        </form>

                        {/* Import summary results panel */}
                        {bulkSummary && (
                          <div className="mt-4 border-t border-slate-100 pt-3.5 space-y-3">
                            <h4 className="font-bold text-slate-700 text-xs font-[Space_Grotesk]">Resultado do Último Processamento:</h4>
                            
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">
                                ✓ {bulkSummary.success} Cadastrados
                              </span>
                              {bulkSummary.duplicates.length > 0 && (
                                <span className="bg-amber-50 border border-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-lg">
                                  ⚠ {bulkSummary.duplicates.length} Duplicidades Puladas
                                </span>
                              )}
                              {bulkSummary.invalid.length > 0 && (
                                <span className="bg-rose-50 border border-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg">
                                  ✗ {bulkSummary.invalid.length} Erros Encontrados
                                </span>
                              )}
                            </div>

                            {/* Dup report lists */}
                            {bulkSummary.duplicates.length > 0 && (
                              <div className="bg-amber-50/50 border border-amber-100/50 p-2 rounded-xl text-[11px] text-amber-800">
                                <p className="font-bold flex items-center gap-1 mb-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                  Colaboradores pulados (CPF já cadastrado):
                                </p>
                                <ul className="list-disc pl-4 space-y-0.5 max-h-[75px] overflow-y-auto">
                                  {bulkSummary.duplicates.map((dup, idx) => (
                                    <li key={idx}>Line items: {dup}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Errors report lists */}
                            {bulkSummary.invalid.length > 0 && (
                              <div className="bg-rose-50/50 border border-rose-100/50 p-2 rounded-xl text-[11px] text-rose-800">
                                <p className="font-bold flex items-center gap-1 mb-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                  Linhas não processadas (Erros de digitação/formato):
                                </p>
                                <ul className="list-disc pl-4 space-y-0.5 max-h-[75px] overflow-y-auto">
                                  {bulkSummary.invalid.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Exclusive Quick Simulation Tools */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 md:col-span-2 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800 text-lg font-[Space_Grotesk] flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Atalhos Administrador
                      </h3>
                      <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-extrabold uppercase">Homologação</span>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed">
                      Utilize essas ações automáticas para dar bypass em etapas de auditoria ou testar o comportamento do álbum e da loja de pacotes:
                    </p>

                    <div className="space-y-3.5">
                      {/* Infinite coins bypass */}
                      <div className="p-3.5 rounded-2xl border border-indigo-50 bg-indigo-50/10 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 font-[Space_Grotesk]">
                            <Coins className="w-4 h-4 text-amber-500" />
                            Emitir Moedas para Si Mesmo
                          </h4>
                          <p className="text-[10px] text-slate-400">Adicione +250 moedas em seu saldo de modo instantâneo para testar compras na loja.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (onUpdateUser) {
                              onUpdateUser({
                                ...user,
                                coins: user.coins + 250
                              });
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0 animate-pulse"
                        >
                          Adicionar Moedas
                        </button>
                      </div>

                      {/* Unlock all stickers bypass */}
                      <div className="p-3.5 rounded-2xl border border-purple-50 bg-purple-50/10 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5 font-[Space_Grotesk]">
                            <Award className="w-4 h-4 text-purple-500" />
                            Completar Meu Álbum
                          </h4>
                          <p className="text-[10px] text-slate-400">Desbloqueia instantaneamente todas as figurinhas para homologar animações.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (onUpdateUser) {
                              const allIds = getAllStickers().map(s => s.id);
                              onUpdateUser({
                                ...user,
                                stickers: allIds
                              });
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          Liberar Todas
                        </button>
                      </div>

                      {/* Reset self progress */}
                      <div className="p-3.5 rounded-2xl border border-rose-50 bg-rose-50/10 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5 font-[Space_Grotesk]">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            Zerar Progresso & Inventário
                          </h4>
                          <p className="text-[10px] text-slate-400">Esvazia o álbum e moedas para re-jogar na visão de usuário do zero.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (onUpdateUser) {
                              onUpdateUser({
                                ...user,
                                coins: 30,
                                stickers: [],
                                progress: {}
                              });
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          Limpar Progresso
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
                </>
              )}

              {adminSection === 'metas' && (
                <>
              {/* Controle de Liberação das Metas de Segurança */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg font-[Space_Grotesk] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                      Controle Dinâmico de Liberação das Metas de Segurança (HUSF)
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Determine em tempo real quais das 6 Metas Internacionais estão liberadas ou bloqueadas para os colaboradores responderem.</p>
                  </div>
                  
                  {/* Quick toggle controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleReleaseAllMetas}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      ✓ Liberar Todas
                    </button>
                    <button
                      onClick={handleLockAllMetas}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      ✗ Bloquear Todas
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {METAS.map((meta) => {
                    const isReleased = releasedMetas.includes(meta.id);
                    return (
                      <div 
                        key={meta.id} 
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                          isReleased 
                            ? 'bg-emerald-50/15 border-emerald-100 hover:border-emerald-200' 
                            : 'bg-rose-50/10 border-rose-100/40 hover:border-rose-200/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${meta.color}`}>
                            {meta.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm font-[Space_Grotesk] safe-text">{meta.title}</h4>
                            <p className="text-[11px] text-slate-500 safe-text">{meta.desc}</p>
                          </div>
                        </div>

                        {/* Status badge and Toggle Switch */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                          <span className={`text-[9px] uppercase font-extrabold px-2 py-1 rounded-md tracking-wider leading-none ${
                            isReleased 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isReleased ? 'Liberada para Jogar' : 'Bloqueada p/ Equipe'}
                          </span>

                          <button
                            onClick={() => handleToggleMetaRelease(meta.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 leading-none ${
                              isReleased
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isReleased ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-rose-600" /> Bloquear
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Liberar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
                </>
              )}

              {adminSection === 'figurinhas' && (
                <>
              {/* Gerenciamento de Figurinhas da Copa Celso */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/90">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg font-[Space_Grotesk] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
                      Gerenciamento de Figurinhas da Copa da Segurança (Álbum)
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Cadastre, edite e organize as figurinhas do álbum sem sobrecarregar o banco de dados.</p>
                  </div>
                </div>

                {/* Informative Alert - Actionable assign methods */}
                <div className="mb-6 bg-purple-50/70 border border-purple-200 p-4.5 rounded-2xl flex gap-3.5 items-start shadow-xs">
                  <Award className="w-5 h-5 text-purple-600 shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-xs text-purple-950 leading-relaxed font-semibold">
                    <p className="font-extrabold text-purple-950 text-sm mb-1 font-[Space_Grotesk]">💡 Como atribuir Imagens às suas Figurinhas (2 Formas Fáceis)</p>
                    <p className="mb-2 text-slate-700">Escolha a maneira que for mais conveniente para você atualizar as fotos de cada uma das figurinhas:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-white p-3 rounded-xl border border-purple-100 flex flex-col justify-between">
                        <div>
                          <p className="font-extrabold text-purple-800 text-[11px] uppercase tracking-wider mb-1">🚀 1. Pelo Painel Administrativo (Super Fácil)</p>
                          <p className="text-[10.5px] text-slate-500 font-medium leading-normal">Basta encontrar a figurinha na tabela de <strong>"Figurinhas Ativas"</strong>, clicar em <strong>"Editar"</strong>, selecionar uma imagem do computador ou colar um link da internet, e clicar em <strong>"Salvar Alterações"</strong>. O arquivo será enviado para o Supabase Storage automaticamente.</p>
                        </div>
                        <p className="text-[10px] text-purple-700 font-bold mt-2 font-mono">⚡ Atualiza em tempo real para todos!</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-purple-100 flex flex-col justify-between">
                        <div>
                          <p className="font-extrabold text-purple-800 text-[11px] uppercase tracking-wider mb-1">📂 2. Enviando Arquivos ao Projeto (Opcional)</p>
                          <p className="text-[10.5px] text-slate-500 font-medium leading-normal">Você pode carregar as imagens diretamente no gerenciador de arquivos do projeto com os nomes padronizados:</p>
                          <div className="bg-slate-50 p-1.5 rounded-lg text-slate-600 font-mono text-[9px] font-bold mt-1 inline-block">
                            /assets/images/sticker_1.webp (Figurinha #1)<br />
                            /assets/images/sticker_13.webp (Figurinha #13)
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold mt-2">O app detectará e carregará tudo automaticamente!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                  {/* Form to Add/Edit Sticker */}
                  <div id="sticker-form-container" className="lg:col-span-2 bg-slate-50/50 border border-slate-200/65 p-5 rounded-2xl flex flex-col justify-between scroll-mt-6">
                    <div>
                      <h4 className="font-extrabold text-xs text-purple-700 uppercase tracking-widest mb-4 flex items-center justify-between font-[Space_Grotesk]">
                        <span>{editingStickerId !== null ? `✏️ Editar Figurinha #${editingStickerId}` : '✨ Adicionar Cromo no Catálogo'}</span>
                        {editingStickerId !== null && (
                          <span className="text-[10px] lowercase normal-case text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded font-extrabold animate-pulse">modo edição</span>
                        )}
                      </h4>

                      <form onSubmit={handleCreateSticker} className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome da Figurinha</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Celso do Repouso, Meta 7, etc."
                            value={newStickerName}
                            onChange={(e) => setNewStickerName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 font-medium transition-colors"
                            required
                          />
                        </div>

                        {/* ID Input (Optional) */}
                        {editingStickerId === null ? (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                              <span>ID da Figurinha (Opcional)</span>
                              <span className="text-[10px] text-slate-400 font-normal lowercase">gerado automático se vazio</span>
                            </label>
                            <input 
                              type="number" 
                              placeholder="Ex: 1, 2, 3... (ID no álbum)"
                              value={customStickerId}
                              onChange={(e) => setCustomStickerId(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 font-medium transition-colors"
                              min="1"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1 bg-purple-50/40 p-3 rounded-xl border border-purple-100/80 text-[11px] text-purple-900 font-medium">
                            <span className="font-bold uppercase tracking-wider block text-[9px] text-purple-700 mb-0.5">ID da Figurinha sob Edição</span>
                            O ID desta figurinha é fixo em <strong className="font-extrabold text-purple-950 font-mono text-xs">#{editingStickerId}</strong> e não pode ser editado.
                          </div>
                        )}

                        {/* Rarity selector */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Raridade</label>
                          <select 
                            value={newStickerRarity}
                            onChange={(e) => setNewStickerRarity(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 font-medium transition-colors cursor-pointer"
                          >
                            <option value="regular">Regular (Comum)</option>
                            <option value="holografica">Holográfica (Rara)</option>
                            <option value="lendaria">Lendária (Muito Rara)</option>
                            <option value="suprema">Suprema (Extremamente Rara)</option>
                          </select>
                        </div>

                        {/* Album Page Selector */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Página / Seção do Álbum</label>
                          <select 
                            value={newStickerPage}
                            onChange={(e) => setNewStickerPage(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-purple-500 font-medium transition-colors cursor-pointer"
                          >
                            <option value="trabalho">Trabalho em Equipe</option>
                            <option value="evolucao">Evolução Contínua</option>
                            <option value="hall">Hall da Fama</option>
                          </select>
                        </div>

                        {/* Imagem da Figurinha */}
                        <div className="space-y-4 border-t border-slate-200/60 pt-4">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Imagem de Capa da Figurinha</label>
                          
                          {/* Option 1: Upload from PC */}
                          <div className="space-y-1.5">
                            <span className="text-[10.5px] font-bold text-slate-500 block">Opção A: Carregar arquivo de imagem do seu computador (PC)</span>
                            <div className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-3.5 flex flex-col items-center justify-center bg-white hover:bg-slate-50/50 transition-colors relative cursor-pointer">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleStickerFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <Upload className="w-5 h-5 text-slate-400 mb-1" />
                              <span className="text-[10.5px] text-slate-500 font-bold text-center">Clique para escolher imagem do seu PC</span>
                              <span className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-wider font-extrabold text-purple-700">Upload real + compressão automática</span>
                            </div>
                          </div>

                          {/* Option 2: Type filename or URL */}
                          <div className="space-y-1.5">
                            <span className="text-[10.5px] font-bold text-slate-500 block">Opção B: Digite o nome do arquivo enviado OU link da Web (URL)</span>
                            <input 
                              type="text" 
                              placeholder="Ex: celso-conexao-meta2.png ou https://imgur.com/foto.jpg"
                              value={newStickerImage}
                              onChange={(e) => { setNewStickerFile(null); setNewStickerImage(e.target.value); }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-medium transition-colors"
                            />
                            <p className="text-[9px] text-slate-400 leading-normal">
                              💡 <strong>Dica de ouro:</strong> Se você arrastou um arquivo para a pasta do projeto (ex: <code className="bg-slate-100 text-slate-900 px-1 py-0.5 rounded font-bold">celso-conexao-meta2.png</code>), basta digitar o nome exato dele aqui! O sistema resolverá e exibirá automaticamente.
                            </p>
                          </div>

                          {/* Preview container */}
                          {newStickerImage && (
                            <div className="mt-2 bg-purple-50/60 border border-purple-100 p-2.5 text-xs rounded-xl flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                <StickerImage id={editingStickerId || 1} name="Pré-visualização" customImage={newStickerImage} className="w-full h-full object-contain m-0" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block text-[11px] text-purple-950 font-bold max-w-full safe-text">Visualização ativa:</span>
                                <span className="block text-[9.5px] text-slate-500 safe-text max-w-full font-mono">{newStickerFile ? '✓ Imagem pronta para upload no Supabase Storage' : newStickerImage}</span>
                                <button 
                                  type="button" 
                                  onClick={() => { setNewStickerImage(''); setNewStickerFile(null); }} 
                                  className="text-[10px] text-rose-600 font-bold hover:underline"
                                >
                                  Remover/Limpar imagem
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status messages inside the form */}
                        {stickerError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs shadow-2xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{stickerError}</span>
                          </div>
                        )}

                        {stickerSuccess && (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-xs shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{stickerSuccess}</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <button 
                            type="submit"
                            disabled={isCreatingSticker}
                            className={`w-full text-white font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95 ${isCreatingSticker ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800'}`}
                          >
                            {isCreatingSticker ? 'Sincronizando...' : editingStickerId !== null ? 'Salvar Alterações' : 'Adicionar Figurinha'}
                          </button>

                          {editingStickerId !== null && (
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingStickerId(null);
                                setNewStickerName('');
                                setNewStickerImage('');
                                setNewStickerFile(null);
                                setCustomStickerId('');
                              }}
                              className="w-full text-slate-500 bg-white border border-slate-200/80 hover:bg-slate-100/50 hover:text-slate-800 font-extrabold uppercase text-[10px] tracking-wider py-2.5 rounded-xl transition-colors cursor-pointer active:scale-95"
                            >
                              Cancelar Edição
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* List and Search of Stickers */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                        <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1 font-[Space_Grotesk]">
                          📋 Figurinhas Ativas ({allStickersCatalog.length})
                        </h4>
                        <button
                          type="button"
                          disabled={isRestoringCatalog}
                          onClick={handleRestoreDefaultStickers}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 border-none active:scale-95"
                          title="Recria as 17 figurinhas originais (Metas de 1 a 12 e Especiais) se estiverem deletadas"
                        >
                          <Database className="w-3 h-3" />
                          {isRestoringCatalog ? 'Restaurando...' : 'Restaurar Metas Padrão'}
                        </button>
                      </div>

                      <div className="relative w-full sm:w-52 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Buscar figurinha pelo nome..."
                          value={stickerSearch}
                          onChange={(e) => setStickerSearch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            <th className="py-3 px-4 w-16">ID</th>
                            <th className="py-3 px-4">Nome da Figurinha</th>
                            <th className="py-3 px-4">Raridade</th>
                            <th className="py-3 px-4">Seção</th>
                            <th className="py-3 px-4 text-right w-20">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-750 text-xs font-semibold">
                          {allStickersCatalog
                            .filter(st => st.name.toLowerCase().includes(stickerSearch.toLowerCase()))
                            .map((st) => {
                              let badgeColor = "bg-slate-100 text-slate-800";
                              if (st.rarity === 'suprema') badgeColor = "bg-yellow-100 text-yellow-800 font-bold border border-yellow-200";
                              else if (st.rarity === 'lendaria') badgeColor = "bg-fuchsia-100 text-fuchsia-800 font-bold border border-fuchsia-200";
                              else if (st.rarity === 'holografica') badgeColor = "bg-cyan-100 text-cyan-800 font-bold border border-cyan-200";

                              let pageLabel = "Trabalho em Equipe";
                              const stPage = st.page || (st.id >= 1 && st.id <= 6 ? 'trabalho' : st.id >= 7 && st.id <= 12 ? 'evolucao' : 'hall');
                              if (stPage === 'evolucao') pageLabel = "Evolução Contínua";
                              else if (stPage === 'hall') pageLabel = "Hall da Fama";

                              return (
                                <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px]">#{st.id}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                        <StickerImage id={st.id} name={st.name} customImage={st.image} className="w-full h-full object-contain m-0 p-0" />
                                      </div>
                                      <span className="font-semibold text-slate-800 safe-text max-w-[150px] sm:max-w-xs">{st.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded ${badgeColor}`}>
                                      {st.rarity}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold border border-slate-200">
                                      {pageLabel}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingStickerId(st.id);
                                        setNewStickerName(st.name);
                                        setNewStickerRarity(st.rarity);
                                        setNewStickerPage(stPage);
                                        setNewStickerImage(st.image || '');
                                        setNewStickerFile(null);
                                        // Scroll to form smoothly
                                        document.getElementById('sticker-form-container')?.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className="text-purple-600 hover:bg-purple-50 p-1 px-2.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-90 font-bold border-none"
                                      title="Editar figurinha e enviar nova imagem"
                                    >
                                      Editar
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isDeletingStickerId !== null}
                                      onClick={() => {
                                        if (confirm(`Tem certeza de que deseja remover a figurinha "${st.name}"? Isso a removerá do álbum e dos futuros pacotes abertos.`)) {
                                          handleDeleteSticker(st.id);
                                        }
                                      }}
                                      className={`p-1 px-2 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-90 font-bold border-none ${isDeletingStickerId === st.id ? 'text-slate-400 bg-slate-100 cursor-not-allowed animate-pulse' : 'text-rose-600 hover:bg-rose-50'}`}
                                      title="Remover do catálogo"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      {isDeletingStickerId === st.id ? 'Removendo...' : 'Remover'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          {allStickersCatalog.filter(st => st.name.toLowerCase().includes(stickerSearch.toLowerCase())).length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                                Nenhuma figurinha encontrada com esse termo.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}

              {adminSection === 'colaboradores' && (
                <>
              {/* Tabela robusta de gerenciamento e pesquisa de dados de colaboradores */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg font-[Space_Grotesk] flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-indigo-500" />
                      Auditoria e Gerenciamento de Colaboradores
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Veja a listagem de todos que participam do jogo HUSF em tempo real.</p>
                  </div>
                  
                  {/* Search input inside the registry list */}
                  <div className="relative w-full sm:w-80 shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Pesquisar por nome, setor ou CPF..."
                      value={adminSearchFilter}
                      onChange={(e) => setAdminSearchFilter(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs border border-slate-200 focus:border-indigo-500 rounded-xl pl-9.5 pr-4 py-2.5 outline-none font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pl-2">Colaborador</th>
                        <th className="pb-3">CPF</th>
                        <th className="pb-3">Setor</th>
                        <th className="pb-3 text-center">Moedas</th>
                        <th className="pb-3 text-right pr-2">Ações Administrativas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {usersList
                        .filter(u => 
                          u.name.toLowerCase().includes(adminSearchFilter.toLowerCase()) ||
                          u.sector.toLowerCase().includes(adminSearchFilter.toLowerCase()) ||
                          u.cpf.includes(adminSearchFilter)
                        )
                        .map((u) => (
                        <tr key={u.cpf} className="hover:bg-slate-50/50 transition-colors group">
                          {/* Colaborador Avatar & Name */}
                          <td className="py-3 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center border border-indigo-100">
                                {u.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 block safe-text">{u.name}</span>
                                {u.isAdmin && (
                                  <span className="text-[9px] font-black tracking-wider uppercase text-purple-600 bg-purple-50 border border-purple-100 px-1 py-0.5 rounded leading-none mt-0.5 inline-block">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* CPF */}
                          <td className="py-3 font-mono text-xs text-slate-500 tracking-wider">
                            {u.cpf}
                          </td>

                          {/* Setor */}
                          <td className="py-3">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">
                              {u.sector}
                            </span>
                          </td>

                          {/* Coins */}
                          <td className="py-3 text-center">
                            <span className="inline-flex items-center gap-1 font-extrabold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 text-xs">
                              {u.coins} <Coins className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          </td>

                          {/* Quick Admin action links */}
                          <td className="py-3 text-right pr-2">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setAdminViewedUserCpf(u.cpf)}
                                className="text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-2 py-1 transition-all active:scale-95 cursor-pointer"
                                title="Ver perfil, metas e álbum do colaborador"
                              >
                                Perfil
                              </button>

                              {/* Reward buttons */}
                              <button 
                                onClick={() => handleRewardUser(u.cpf, 100)}
                                className="text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-2 py-1 transition-all active:scale-95 cursor-pointer"
                                title="Recompensar com 100 Moedas"
                              >
                                +100
                              </button>
                              <button 
                                onClick={() => handleRewardUser(u.cpf, 500)}
                                className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2 py-1 transition-all active:scale-95 cursor-pointer"
                                title="Recompensar com 500 Moedas"
                              >
                                +500
                              </button>

                              {/* Gift sticker select dropdown */}
                              <select
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    handleGiftSticker(u.cpf, parseInt(val));
                                    e.target.value = ''; // Reset select
                                  }
                                }}
                                className="text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg px-1.5 py-1.5 border border-indigo-100 outline-none cursor-pointer max-w-[110px]"
                                defaultValue=""
                              >
                                <option value="" disabled>🎁 Dar Figurinha</option>
                                {allStickersCatalog.map(st => (
                                  <option key={st.id} value={st.id}>
                                    #{st.id} - {st.name}
                                  </option>
                                ))}
                              </select>

                              {/* Persistent state-based confirmation delete link */}
                              {confirmDeleteCpf === u.cpf ? (
                                <div className="inline-flex items-center gap-1 animate-pulse bg-red-50 p-1 border border-red-200 rounded-lg">
                                  <button
                                    onClick={() => handleDeleteUser(u.cpf)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[9px] tracking-wider px-2 py-1 rounded-md"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteCpf(null)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[9px] px-1.5 py-1 rounded-md"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (u.cpf === user.cpf) return;
                                    setConfirmDeleteCpf(u.cpf);
                                  }}
                                  disabled={u.cpf === user.cpf}
                                  className={`p-2 rounded-lg transition-all ${u.cpf === user.cpf ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer active:scale-95'}`}
                                  title="Excluir Colaborador"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                </>
              )}

              {adminSection === 'monitoramento' && (
                <>
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
                  <div>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-2">
                      <Building2 className="w-3.5 h-3.5" /> Acompanhamento por setor
                    </span>
                    <h3 className="font-black text-slate-900 text-xl sm:text-2xl font-[Space_Grotesk]">Quem fez os quizzes</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      Todos os colaboradores ficam no acompanhamento. Para manter leve, a tabela mostra 100 por página e preserva o resumo completo do setor selecionado.
                    </p>
                  </div>

                  <div className="w-full lg:w-72">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Filtrar setor</label>
                    <select
                      value={adminQuizSectorFilter}
                      onChange={(e) => setAdminQuizSectorFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    >
                      <option value="all">Todos os setores</option>
                      {adminQuizSectorOptions.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                  <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Setor selecionado</p>
                    <p className="text-lg font-black text-slate-900 font-[Space_Grotesk] mt-1 safe-text">{adminQuizSectorReport.selectedSector}</p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">{adminQuizSectorReport.total} colaboradores no acompanhamento</p>
                  </div>
                  <div className="rounded-2xl p-4 border border-emerald-100 bg-emerald-50/60">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Fizeram quiz</p>
                    <p className="text-3xl font-black text-emerald-700 font-[Space_Grotesk] mt-1">{adminQuizSectorReport.didQuiz}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">Responderam pelo menos uma meta</p>
                  </div>
                  <div className="rounded-2xl p-4 border border-rose-100 bg-rose-50/60">
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-700">Ainda não fizeram</p>
                    <p className="text-3xl font-black text-rose-700 font-[Space_Grotesk] mt-1">{adminQuizSectorReport.pending}</p>
                    <p className="text-[11px] text-rose-700 font-semibold mt-1">Prioridade para cobrar/incentivar</p>
                  </div>
                  <div className="rounded-2xl p-4 border border-blue-100 bg-blue-50/60">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Concluíram meta</p>
                    <p className="text-3xl font-black text-blue-700 font-[Space_Grotesk] mt-1">{adminQuizSectorReport.completedAtLeastOne}</p>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">Média do filtro: {adminQuizSectorReport.averageEngagement}%</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-2 mb-5">
                  {adminQuizSectorReport.metaTotals.map((item) => (
                    <div key={item.meta.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.meta.title}</p>
                      <p className="font-black text-slate-800 text-sm mt-1 safe-text">{item.answered}/{adminQuizSectorReport.total} fizeram</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{item.completed} concluíram • {item.completedRate}%</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full min-w-[880px] text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3">Colaborador</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Metas feitas</th>
                        <th className="px-4 py-3 text-center">Aproveitamento</th>
                        <th className="px-4 py-3">Último quiz</th>
                        <th className="px-4 py-3">Detalhe por meta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminQuizSectorReport.paginatedRows.length > 0 ? adminQuizSectorReport.paginatedRows.map((row) => (
                        <tr key={row.collaborator.cpf} className="bg-white hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-black text-slate-800 text-sm safe-text">{row.collaborator.name}</p>
                            <p className="text-[11px] text-slate-500 font-semibold safe-text">{row.collaborator.sector}</p>
                            <button
                              type="button"
                              onClick={() => setAdminViewedUserCpf(row.collaborator.cpf)}
                              className="mt-1 inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-700 hover:bg-white hover:text-brand-700 transition-all"
                            >
                              Ver perfil completo
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {row.didAnyQuiz ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Fez quiz
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                                <AlertCircle className="w-3.5 h-3.5" /> Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-black text-slate-800">{row.completedCount}/{METAS.length}</span>
                            <p className="text-[10px] text-slate-400 font-bold">{row.answeredCount} respondidas</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-black text-brand-700">{row.engagement.aproveitamento}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-500 font-bold">{row.lastQuizAt ? formatActivityTime(row.lastQuizAt) : 'Sem quiz registrado'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {row.metaStatuses.map((status) => (
                                <span
                                  key={`${row.collaborator.cpf}-${status.metaId}`}
                                  title={`${status.label}: ${status.completed ? 'concluída' : status.answered ? 'respondida' : 'pendente'} • ${status.attempts} tentativa(s) • ${status.coins} pontos`}
                                  className={`inline-flex items-center justify-center min-w-9 rounded-lg px-2 py-1 text-[10px] font-black border ${
                                    status.completed
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : status.answered
                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                  }`}
                                >
                                  {status.label}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400 font-semibold">
                            Nenhum colaborador encontrado para este setor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {adminQuizSectorReport.rows.length > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold text-slate-500">
                      Mostrando {adminQuizSectorReport.pageStart + 1} a {adminQuizSectorReport.pageEnd} de {adminQuizSectorReport.total} colaboradores.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdminQuizPage(page => Math.max(0, page - 1))}
                        disabled={adminQuizSectorReport.currentPage === 0}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                      >
                        Anterior
                      </button>
                      <span className="text-xs font-black text-slate-500">
                        Página {adminQuizSectorReport.currentPage + 1} de {adminQuizSectorReport.totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminQuizPage(page => Math.min(adminQuizSectorReport.totalPages - 1, page + 1))}
                        disabled={adminQuizSectorReport.currentPage >= adminQuizSectorReport.totalPages - 1}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1">Verde: meta concluída</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1">Amarelo: respondeu, mas ainda não concluiu</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1">Cinza: pendente</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Ações registradas</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800 font-[Space_Grotesk]">{adminActivityLog.length}</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Últimos eventos carregados</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Últimos 7 dias</span>
                    <Zap className="w-5 h-5 text-brand-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800 font-[Space_Grotesk]">{activitiesThisWeek}</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Movimentações recentes</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Sem atividade</span>
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800 font-[Space_Grotesk]">{inactiveCollaborators.length}</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Colaboradores parados há 7 dias</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg font-[Space_Grotesk] flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse" />
                        Histórico real de atividades
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Quizzes, recompensas, loja, figurinhas e trocas registrados por colaborador.</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                      Monitoramento em tempo real
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {adminActivityLog.length > 0 ? adminActivityLog.map(({ entry, user: activityUser }) => (
                      <div key={`${activityUser.cpf}-${entry.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-white hover:shadow-sm transition-all">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0 ${getActivityBadgeClass(entry.type)}`}>
                          {getActivityTypeLabel(entry.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5">
                            <div>
                              <p className="text-slate-700 leading-relaxed">
                                <span className="font-black text-slate-900">{activityUser.name}</span> <span className="text-slate-400">({activityUser.sector})</span> — <span className="font-bold">{entry.title}</span>
                              </p>
                              <p className="text-slate-500 mt-0.5 leading-relaxed">{entry.description}</p>
                            </div>
                            <div className="shrink-0 sm:text-right">
                              {typeof entry.points === 'number' && entry.points !== 0 && (
                                <p className={`font-black ${entry.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {entry.points > 0 ? '+' : ''}{entry.points}
                                </p>
                              )}
                              <span className="text-[10px] text-slate-400 block font-medium whitespace-nowrap">{formatActivityTime(entry.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                        Ainda não há histórico real. Assim que colaboradores responderem quizzes, comprarem pacotes ou receberem recompensas, os eventos aparecerão aqui.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg font-[Space_Grotesk]">Atenção do admin</h3>
                      <p className="text-xs text-slate-500">Quem pode precisar de incentivo.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {inactiveCollaborators.length > 0 ? inactiveCollaborators.map(({ user: inactiveUser, lastActivityAt }) => (
                      <div key={inactiveUser.cpf} className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm safe-text">{inactiveUser.name}</p>
                          <p className="text-[11px] text-slate-500 safe-text">{inactiveUser.sector}</p>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-white border border-rose-100 px-2 py-1 rounded-lg whitespace-nowrap">
                          {lastActivityAt ? formatActivityTime(lastActivityAt) : 'Sem histórico'}
                        </span>
                      </div>
                    )) : (
                      <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 text-xs font-bold leading-relaxed">
                        Ótimo! Todos os colaboradores carregados têm atividade recente ou ainda não atingiram o limite de alerta.
                      </div>
                    )}
                  </div>
                </div>
              </div>
                </>
              )}

            </motion.div>
          )}
        </AnimatePresence>
        </div>

      </div>

      <AnimatePresence>
        {user.isAdmin && adminViewedUser && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 px-3 py-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-profile-viewer-title"
            onClick={() => setAdminViewedUserCpf(null)}
          >
            {(() => {
              const viewedUser = adminViewedUser as User;
              const engagement = calculateUserEngagement(viewedUser);
              const viewedStickerIds = new Set(viewedUser.stickers || []);
              const collectedStickers = allStickersCatalog.filter(sticker => viewedStickerIds.has(sticker.id));
              const uniqueCollectedCount = collectedStickers.length;
              const collectionPercent = allStickersCatalog.length > 0
                ? roundOneDecimal((uniqueCollectedCount / allStickersCatalog.length) * 100)
                : 0;
              const viewedActivities = getActivityLog(viewedUser).slice(0, 8);

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 12 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[2rem] border border-white/20 bg-slate-50 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 z-20 overflow-hidden rounded-t-[2rem] bg-gradient-to-r from-slate-950 via-brand-800 to-emerald-700 p-5 text-white shadow-lg">
                    <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-black shadow-lg backdrop-blur">
                          {viewedUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
                            Visualização do administrador
                          </span>
                          <h2 id="admin-profile-viewer-title" className="mt-2 text-2xl sm:text-3xl font-black leading-tight font-[Space_Grotesk] safe-text">
                            {viewedUser.name}
                          </h2>
                          <p className="text-sm font-semibold text-emerald-100 safe-text">{viewedUser.sector} • CPF {formatCPF(viewedUser.cpf)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminViewedUserCpf(null)}
                        className="absolute right-0 top-0 sm:static rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                        aria-label="Fechar perfil do colaborador"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pontuação oficial</p>
                        <p className="mt-1 text-3xl font-black text-brand-700 font-[Space_Grotesk]">{engagement.rankingScore}%</p>
                        <p className="text-[11px] font-semibold text-slate-500">pontos dos quizzes / 900 pontos possíveis</p>
                      </div>
                      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aproveitamento</p>
                        <p className="mt-1 text-3xl font-black text-emerald-700 font-[Space_Grotesk]">{engagement.aproveitamento}%</p>
                        <p className="text-[11px] font-semibold text-slate-500">{engagement.totalQuizCoins}/{engagement.maxQuizCoins} pontos nos quizzes</p>
                      </div>
                      <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Velocidade média</p>
                        <p className="mt-1 text-3xl font-black text-amber-700 font-[Space_Grotesk]">{engagement.hasSpeedData ? engagement.averageResponseTimeLabel : '--'}</p>
                        <p className="text-[11px] font-semibold text-slate-500">{engagement.hasSpeedData ? `${engagement.speedScore}% no indicador velocidade` : 'Sem tempo novo registrado'}</p>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Metas concluídas</p>
                        <p className="mt-1 text-3xl font-black text-blue-700 font-[Space_Grotesk]">{engagement.metasConcluidas}/{engagement.totalMetas}</p>
                        <p className="text-[11px] font-semibold text-slate-500">{engagement.metasParticipadas} metas respondidas</p>
                      </div>
                      <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Álbum</p>
                        <p className="mt-1 text-3xl font-black text-purple-700 font-[Space_Grotesk]">{uniqueCollectedCount}/{allStickersCatalog.length}</p>
                        <p className="text-[11px] font-semibold text-slate-500">{collectionPercent}% das figurinhas</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <h3 className="font-black text-slate-800 font-[Space_Grotesk]">Situação das metas</h3>
                            <p className="text-xs font-semibold text-slate-500">Veja o que respondeu, concluiu e quantas tentativas fez.</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {METAS.map((meta) => {
                            const progress = viewedUser.progress?.[meta.id];
                            const answered = hasMetaQuizActivity(progress);
                            const completed = isMetaCompleted(progress);
                            const released = releasedMetas.includes(meta.id);
                            return (
                              <div key={`admin-profile-meta-${meta.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${completed ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : answered ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {completed ? 'Concluída' : answered ? 'Respondida' : 'Pendente'}
                                      </span>
                                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${released ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {released ? 'Liberada' : 'Bloqueada'}
                                      </span>
                                    </div>
                                    <h4 className="mt-2 font-black text-slate-800 safe-text">{meta.title}: {meta.desc}</h4>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-500 safe-text">
                                      Último acesso: {progress?.lastPlayedDate ? formatActivityTime(progress.lastPlayedDate) : 'sem registro'}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[240px]">
                                    <div className="rounded-xl bg-white px-2 py-2 border border-slate-100">
                                      <p className="text-[9px] font-black uppercase text-slate-400">Pontos</p>
                                      <p className="font-black text-slate-800">{progress?.totalCoinsEarned || 0}</p>
                                    </div>
                                    <div className="rounded-xl bg-white px-2 py-2 border border-slate-100">
                                      <p className="text-[9px] font-black uppercase text-slate-400">Tentativas</p>
                                      <p className="font-black text-slate-800">{getMetaAttemptCount(progress)}</p>
                                    </div>
                                    <div className="rounded-xl bg-white px-2 py-2 border border-slate-100">
                                      <p className="text-[9px] font-black uppercase text-slate-400">Tempo</p>
                                      <p className="font-black text-slate-800">{formatAverageSeconds(progress?.averageResponseTimeMs || progress?.bestAverageResponseTimeMs)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                          <LayoutGrid className="h-5 w-5 text-purple-500" />
                          <div>
                            <h3 className="font-black text-slate-800 font-[Space_Grotesk]">Álbum do colaborador</h3>
                            <p className="text-xs font-semibold text-slate-500">Figurinhas coloridas foram conquistadas; cinzas ainda faltam.</p>
                          </div>
                        </div>

                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-purple-600" style={{ width: `${Math.min(100, Math.max(0, collectionPercent))}%` }} />
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[520px] overflow-y-auto pr-1">
                          {allStickersCatalog.map((sticker) => {
                            const hasSticker = viewedStickerIds.has(sticker.id);
                            return (
                              <div
                                key={`admin-profile-sticker-${sticker.id}`}
                                onClick={() => hasSticker && setZoomedSticker(sticker)}
                                title={`${sticker.name} ${hasSticker ? 'conquistada' : 'faltando'}`}
                                className={`aspect-[2.5/3.5] rounded-xl border p-1.5 text-center transition-all ${hasSticker ? 'cursor-pointer bg-white border-purple-100 shadow-sm hover:scale-[1.03]' : 'bg-slate-100 border-slate-200 opacity-70'}`}
                              >
                                {hasSticker ? (
                                  <>
                                    <StickerImage id={sticker.id} name={sticker.name} customImage={sticker.image} className="!max-h-[90px]" />
                                    <p className="mt-1 line-clamp-2 text-[9px] font-black uppercase leading-tight text-slate-700">{sticker.name}</p>
                                  </>
                                ) : (
                                  <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400">
                                    <span className="text-2xl font-black font-[Space_Grotesk]">#{sticker.id}</span>
                                    <p className="mt-1 line-clamp-2 px-1 text-[8px] font-black uppercase leading-tight">{sticker.name}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>

                    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Zap className="h-5 w-5 text-brand-500" />
                        <div>
                          <h3 className="font-black text-slate-800 font-[Space_Grotesk]">Histórico recente</h3>
                          <p className="text-xs font-semibold text-slate-500">Últimas movimentações salvas desse participante.</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {viewedActivities.length > 0 ? viewedActivities.map((entry) => (
                          <div key={`admin-view-activity-${entry.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <span className={`inline-flex rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${getActivityBadgeClass(entry.type)}`}>
                                  {getActivityTypeLabel(entry.type)}
                                </span>
                                <p className="mt-2 font-black text-slate-800">{entry.title}</p>
                                <p className="mt-0.5 font-semibold text-slate-500">{entry.description}</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatActivityTime(entry.createdAt)}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-400">
                            Ainda não existe histórico recente para este colaborador.
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMarketNewsModal && !user.isAdmin && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="market-news-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-200/50 bg-white shadow-2xl"
            >
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-emerald-600 via-brand-600 to-slate-900" />
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-300/30 blur-2xl" />
              <div className="absolute -left-12 top-16 h-32 w-32 rounded-full bg-white/20 blur-2xl" />

              <button
                type="button"
                onClick={() => handleCloseMarketNews(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                aria-label="Fechar aviso"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-3 text-white">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur">
                    <AlertCircle className="h-7 w-7 text-amber-200" />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900">
                      Atenção
                    </span>
                    <h2 id="market-news-title" className="mt-2 text-xl font-black leading-tight tracking-tight sm:text-2xl font-[Space_Grotesk]">
                      Prazo das Metas 1 e 2 prorrogado!
                    </h2>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold leading-relaxed text-slate-600">
                    ATENÇÃO: PRORROGADO A DATA LIMITE DAS METAS 1 E 2 ATÉ O DIA 12/06/2026.
                  </p>

                  <div className="mt-4 grid gap-2 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-amber-800">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Não deixe para fazer na última hora.
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-rose-800">
                      <Zap className="h-4 w-4 shrink-0" />
                      Com muitos acessos, o aplicativo pode ficar lento.
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Faça as metas com antecedência e evite instabilidade.
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleCloseMarketNews(false)}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-amber-600/20 transition hover:scale-[1.01] active:scale-[0.98]"
                    >
                      Entendi
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

