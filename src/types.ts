export type ActivityLogType = 'quiz' | 'reward' | 'purchase' | 'sticker' | 'trade' | 'system';

export interface ActivityLogEntry {
  id: string;
  type: ActivityLogType;
  title: string;
  description: string;
  points?: number;
  metaId?: number;
  stickerIds?: number[];
  coinsBefore?: number;
  coinsAfter?: number;
  actor?: string;
  createdAt: string;
}

export interface MetaProgress {
  metaId: number;
  lastPlayedDate: string;
  attemptsToday: number;
  highestCoinsToday: number;
  totalCoinsEarned: number;
  isAmador: boolean; // Set to true after the first day of play
  hasPerfected?: boolean;
  totalAttempts?: number;
  // Métricas extras para deixar o ranking mais justo.
  // São opcionais para manter compatibilidade com usuários antigos já salvos no Supabase.
  totalCorrectAnswers?: number;
  totalQuestionsAnswered?: number;
  totalResponseTimeMs?: number;
  averageResponseTimeMs?: number;
  bestAverageResponseTimeMs?: number;
  lastAttemptCorrectAnswers?: number;
  lastAttemptQuestions?: number;
  lastAttemptResponseTimeMs?: number;
  completedAt?: string;
}

export interface User {
  cpf: string;
  name: string;
  sector: string;
  coins: number;
  stickers: number[];
  progress: Record<number, MetaProgress>;
  activityLog?: ActivityLogEntry[];
  isAdmin?: boolean;
  updatedAt?: string;
}

