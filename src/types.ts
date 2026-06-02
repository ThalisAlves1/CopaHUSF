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
  isAdmin?: boolean;
}
