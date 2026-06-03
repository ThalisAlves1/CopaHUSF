import { ActivityLogEntry, ActivityLogType, User } from '../types';

export const MAX_ACTIVITY_LOG_ITEMS = 80;

function generateActivityId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createActivityEntry(input: {
  type: ActivityLogType;
  title: string;
  description: string;
  points?: number;
  metaId?: number;
  stickerIds?: number[];
  coinsBefore?: number;
  coinsAfter?: number;
  actor?: string;
}): ActivityLogEntry {
  return {
    id: generateActivityId(),
    type: input.type,
    title: input.title,
    description: input.description,
    points: input.points ?? 0,
    metaId: input.metaId,
    stickerIds: input.stickerIds,
    coinsBefore: input.coinsBefore,
    coinsAfter: input.coinsAfter,
    actor: input.actor,
    createdAt: new Date().toISOString()
  };
}

export function getActivityLog(user?: User | null): ActivityLogEntry[] {
  if (!user) return [];

  const fromUser = Array.isArray(user.activityLog) ? user.activityLog : [];
  const progressLog = Array.isArray((user.progress as any)?.__activityLog)
    ? (user.progress as any).__activityLog
    : [];

  const source = fromUser.length ? fromUser : progressLog;

  return source
    .filter((item: any) => item && typeof item === 'object' && item.createdAt)
    .map((item: any) => ({
      id: String(item.id || generateActivityId()),
      type: (item.type || 'system') as ActivityLogType,
      title: String(item.title || 'Atividade registrada'),
      description: String(item.description || ''),
      points: Number(item.points || 0),
      metaId: item.metaId ? Number(item.metaId) : undefined,
      stickerIds: Array.isArray(item.stickerIds) ? item.stickerIds.map(Number).filter(Boolean) : undefined,
      coinsBefore: typeof item.coinsBefore === 'number' ? item.coinsBefore : undefined,
      coinsAfter: typeof item.coinsAfter === 'number' ? item.coinsAfter : undefined,
      actor: item.actor ? String(item.actor) : undefined,
      createdAt: String(item.createdAt)
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_ACTIVITY_LOG_ITEMS);
}

export function embedActivityLogInProgress(user: User, log = getActivityLog(user)) {
  return {
    ...(user.progress || {}),
    __activityLog: log.slice(0, MAX_ACTIVITY_LOG_ITEMS)
  } as any;
}

export function appendActivityLog(user: User, entry: ActivityLogEntry): User {
  const log = [entry, ...getActivityLog(user)].slice(0, MAX_ACTIVITY_LOG_ITEMS);
  return {
    ...user,
    activityLog: log,
    progress: embedActivityLogInProgress(user, log)
  };
}

export function formatActivityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não informada';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;
  if (diffHours < 24) return `Há ${diffHours} h`;
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function getActivityTypeLabel(type: ActivityLogType) {
  const labels: Record<ActivityLogType, string> = {
    quiz: 'Quiz',
    reward: 'Recompensa',
    purchase: 'Loja',
    sticker: 'Figurinha',
    trade: 'Troca',
    system: 'Sistema'
  };
  return labels[type] || 'Sistema';
}

export function getActivityBadgeClass(type: ActivityLogType) {
  const classes: Record<ActivityLogType, string> = {
    quiz: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    reward: 'bg-amber-50 text-amber-700 border-amber-100',
    purchase: 'bg-slate-50 text-slate-700 border-slate-200',
    sticker: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    trade: 'bg-purple-50 text-purple-700 border-purple-100',
    system: 'bg-blue-50 text-blue-700 border-blue-100'
  };
  return classes[type] || classes.system;
}
