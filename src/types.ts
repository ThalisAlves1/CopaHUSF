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
}
