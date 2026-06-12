import { createClient } from '@supabase/supabase-js';
import { User } from '../types';
import { StickerDefinition, StickerRarity, getStickerById } from './store';
import { embedActivityLogInProgress, getActivityLog } from './activity';

/*
  ========================================================================
  SUPABASE SQL SCRIPTS - COPY AND PASTER UNDER "SQL EDITOR" IN SUPABASE:
  ========================================================================

  -- 1. Table for Album Stickers
  CREATE TABLE IF NOT EXISTS public.husf_stickers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Enable row level security and allow everyone public read/write (for simple tournament/gamification flow)
  ALTER TABLE public.husf_stickers ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public Read All" ON public.husf_stickers FOR SELECT USING (true);
  CREATE POLICY "Public Insert All" ON public.husf_stickers FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public Update All" ON public.husf_stickers FOR UPDATE USING (true);
  CREATE POLICY "Public Delete All" ON public.husf_stickers FOR DELETE USING (true);

  -- 2. Table for Collaborative Users / Players progress
  CREATE TABLE IF NOT EXISTS public.husf_users (
    cpf TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    coins INTEGER DEFAULT 0 NOT NULL,
    stickers JSONB DEFAULT '[]'::jsonb NOT NULL,
    progress JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  ALTER TABLE public.husf_users ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public Users Select" ON public.husf_users FOR SELECT USING (true);
  CREATE POLICY "Public Users Insert" ON public.husf_users FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public Users Update" ON public.husf_users FOR UPDATE USING (true);
  CREATE POLICY "Public Users Delete" ON public.husf_users FOR DELETE USING (true);

  -- 3. Table for P2P trading sessions
  CREATE TABLE IF NOT EXISTS public.husf_trades (
    id TEXT PRIMARY KEY,
    initiator_user_id TEXT NOT NULL,
    initiator_user_name TEXT NOT NULL,
    initiator_sticker_id INTEGER NOT NULL,
    initiator_confirmed BOOLEAN DEFAULT false NOT NULL,
    receiver_user_id TEXT,
    receiver_user_name TEXT,
    receiver_sticker_id INTEGER,
    receiver_confirmed BOOLEAN DEFAULT false NOT NULL,
    status TEXT NOT NULL, -- 'pending' | 'negotiating' | 'completed' | 'cancelled'
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  ALTER TABLE public.husf_trades ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public Trades Select" ON public.husf_trades FOR SELECT USING (true);
  CREATE POLICY "Public Trades Insert" ON public.husf_trades FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public Trades Update" ON public.husf_trades FOR UPDATE USING (true);
  CREATE POLICY "Public Trades Delete" ON public.husf_trades FOR DELETE USING (true);

  -- 4. Shared app settings, such as released goals/metas controlled by admin
  CREATE TABLE IF NOT EXISTS public.husf_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  ALTER TABLE public.husf_settings ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public Settings Select" ON public.husf_settings FOR SELECT USING (true);
  CREATE POLICY "Public Settings Insert" ON public.husf_settings FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public Settings Update" ON public.husf_settings FOR UPDATE USING (true);
  CREATE POLICY "Public Settings Delete" ON public.husf_settings FOR DELETE USING (true);

  -- 5. Realtime support. Run this once in Supabase SQL Editor or enable the tables
  -- under Database > Publications > supabase_realtime.
  ALTER TABLE public.husf_users REPLICA IDENTITY FULL;
  ALTER TABLE public.husf_stickers REPLICA IDENTITY FULL;
  ALTER TABLE public.husf_settings REPLICA IDENTITY FULL;

  DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.husf_users;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.husf_stickers;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.husf_settings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  -- 6. Storage bucket for real sticker image uploads from the Admin panel.
  -- Run this once so the app can upload images and everyone can see them.
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('husf-stickers', 'husf-stickers', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

  DO $$ BEGIN
    CREATE POLICY "Public Read Sticker Images" ON storage.objects
      FOR SELECT USING (bucket_id = 'husf-stickers');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE POLICY "Public Upload Sticker Images" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'husf-stickers');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE POLICY "Public Update Sticker Images" ON storage.objects
      FOR UPDATE USING (bucket_id = 'husf-stickers') WITH CHECK (bucket_id = 'husf-stickers');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE POLICY "Public Delete Sticker Images" ON storage.objects
      FOR DELETE USING (bucket_id = 'husf-stickers');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  ========================================================================
*/

// Helper to load Supabase configuration either from Vite environment variables or browser localStorage
export function getSupabaseConfig() {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  if (envUrl && envKey) {
    return { url: envUrl.trim(), key: envKey.trim(), source: 'env' };
  }
  
  try {
    const localConfig = localStorage.getItem('husf_supabase_config');
    if (localConfig) {
      const parsed = JSON.parse(localConfig);
      if (parsed?.url && parsed?.key) {
        return { url: parsed.url.trim(), key: parsed.key.trim(), source: 'local' };
      }
    }
  } catch (e) {
    console.error('Error reading husf_supabase_config:', e);
  }
  
  return { url: '', key: '', source: 'none' };
}

// Function to manually set the Supabase config dynamically
export function setSupabaseConfig(url: string, key: string) {
  if (!url || !key) {
    localStorage.removeItem('husf_supabase_config');
  } else {
    localStorage.setItem('husf_supabase_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
  }
}

// Function to clear manual config
export function clearSupabaseConfig() {
  localStorage.removeItem('husf_supabase_config');
}

const config = getSupabaseConfig();
export const supabaseUrl = config.url;
export const supabaseAnonKey = config.key;
export const supabaseConfigSource = config.source;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
export let lastSupabaseError: string | null = null;

export const supabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const STICKER_STORAGE_BUCKET = 'husf-stickers';

function safeStorageFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'figurinha';
}

export async function uploadStickerImageFile(file: File, stickerId: number): Promise<string> {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar upload real de imagens.');
  }

  const extensionFromType = file.type === 'image/webp' ? 'webp'
    : file.type === 'image/png' ? 'png'
    : file.type === 'image/jpeg' || file.type === 'image/jpg' ? 'jpg'
    : file.name.split('.').pop()?.toLowerCase() || 'webp';

  const safeName = safeStorageFileName(file.name.replace(/\.[^.]+$/, ''));
  const path = `stickers/sticker_${stickerId}_${Date.now()}_${safeName}.${extensionFromType}`;

  const { error } = await promiseWithTimeout(
    supabaseClient.storage
      .from(STICKER_STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'image/webp'
      }) as any,
    30000
  ) as any;

  if (error) {
    const message = String(error.message || error.error || error);
    if (message.toLowerCase().includes('bucket')) {
      throw new Error(`Bucket de imagens não encontrado ou sem permissão. Crie o bucket público "${STICKER_STORAGE_BUCKET}" no Supabase Storage e aplique as políticas do SQL atualizado.`);
    }
    throw error;
  }

  const { data } = supabaseClient.storage.from(STICKER_STORAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Upload concluído, mas não foi possível gerar a URL pública da imagem.');
  }

  return data.publicUrl;
}

// Default initial user mock if local/Supabase database is empty or not yet provisioned
export const DB_DEFAULT_USERS: User[] = [
  { cpf: '111.111.111-11', name: 'Ana Souza', sector: 'UTI Adulto', coins: 30, stickers: [1, 5, 12], progress: {}, isAdmin: true },
  { cpf: '222.222.222-22', name: 'Bruno Santos', sector: 'Pronto Socorro', coins: 10, stickers: [], progress: {} },
  { cpf: '333.333.333-33', name: 'Carolina Lima', sector: 'Centro Cirúrgico', coins: 150, stickers: [], progress: {} },
  { cpf: '444.444.444-44', name: 'Dr. Roberto Alves', sector: 'Clínica Médica', coins: 0, stickers: [], progress: {} },
  { cpf: '136.832.356-16', name: 'Thalis Alves Ramos', sector: 'Diretoria de Ensino e Pesquisa', coins: 850, stickers: [1, 3, 5, 7, 9, 11, 13], progress: {}, isAdmin: true },
];


export const normalizeCpf = (value: string | number | null | undefined): string => {
  return String(value || '').replace(/\D/g, '');
};

export function mapSupabaseUserRow(row: any): User {
  const cleanCpf = normalizeCpf(row?.cpf);
  const isThisAdmin = cleanCpf === '13683235616' || cleanCpf === '11111111111' || !!row?.is_admin;
  const progress = typeof row?.progress === 'object' && row.progress !== null ? row.progress : {};

  const user: User = {
    cpf: String(row?.cpf || ''),
    name: cleanCpf === '13683235616'
      ? 'Thalis Alves Ramos'
      : (row?.name || 'Sem Nome'),
    sector: cleanCpf === '13683235616'
      ? 'Diretoria de Ensino e Pesquisa'
      : (row?.sector || 'Outro Setor'),
    coins: typeof row?.coins === 'number' ? row.coins : Number(row?.coins || 0),
    stickers: Array.isArray(row?.stickers) ? row.stickers : [],
    progress,
    isAdmin: isThisAdmin,
    updatedAt: row?.updated_at || row?.updatedAt
  };

  user.activityLog = getActivityLog(user);
  return user;
}

function upsertLocalUserCache(user: User) {
  try {
    const raw = localStorage.getItem('husf_users');
    const users = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(users) ? users : [];
    const cleanCpf = normalizeCpf(user.cpf);
    const index = list.findIndex((u: any) => normalizeCpf(u?.cpf) === cleanCpf);
    if (index >= 0) {
      list[index] = user;
    } else {
      list.push(user);
    }
    localStorage.setItem('husf_users', JSON.stringify(list));
  } catch (err) {
    console.warn('Não foi possível atualizar cache local do usuário:', err);
  }
}

function getLocalCachedUserByCpf(cpf: string): User | null {
  try {
    const raw = localStorage.getItem('husf_users');
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return null;
    const clean = normalizeCpf(cpf);
    const found = parsed.find((u: any) => u && normalizeCpf(u?.cpf) === clean);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  } catch {
    return null;
  }
}

function getUserUpdatedTime(user?: User | null): number {
  if (!user?.updatedAt) return 0;
  const value = Date.parse(user.updatedAt);
  return Number.isFinite(value) ? value : 0;
}

function preferLocalIfNewer(remoteUser: User): User {
  const localUser = getLocalCachedUserByCpf(remoteUser.cpf);
  if (!localUser) return remoteUser;

  const localTime = getUserUpdatedTime(localUser);
  const remoteTime = getUserUpdatedTime(remoteUser);

  // Quando o celular comprou figurinha/moeda e a nuvem ainda não recebeu,
  // não deixe uma consulta antiga do Supabase apagar o progresso local.
  if (localTime && (!remoteTime || localTime > remoteTime + 1000)) {
    void dbSaveSingleUser(localUser).catch((err) => {
      console.warn('Tentativa de reenviar progresso local mais recente falhou:', err);
    });
    return localUser;
  }

  return remoteUser;
}

export async function dbFindUserByCpf(cpf: string): Promise<User | null> {
  const cleanCpfInput = normalizeCpf(cpf);
  if (!cleanCpfInput) return null;

  if (isSupabaseConfigured && supabaseClient) {
    try {
      const variants = cpfSearchVariants(cpf);
      const { data, error } = await promiseWithTimeout(
        supabaseClient
          .from('husf_users')
          .select('cpf,name,sector,coins,stickers,progress,is_admin,updated_at')
          .in('cpf', variants) as any
      ) as any;

      if (error) throw error;

      const row = (data || []).find((u: any) => normalizeCpf(u?.cpf) === cleanCpfInput);
      lastSupabaseError = null;

      if (!row) return null;

      const user = preferLocalIfNewer(mapSupabaseUserRow(row));
      upsertLocalUserCache(user);
      return JSON.parse(JSON.stringify(user));
    } catch (err) {
      lastSupabaseError = err instanceof Error ? err.message : String(err);
      console.warn('Busca de CPF no Supabase falhou, tentando cache local:', err);
    }
  }

  try {
    const raw = localStorage.getItem('husf_users');
    const users = raw ? JSON.parse(raw) : DB_DEFAULT_USERS;
    const list = Array.isArray(users) ? users : DB_DEFAULT_USERS;
    const found = list.find((u: any) => normalizeCpf(u?.cpf) === cleanCpfInput);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  } catch {
    const found = DB_DEFAULT_USERS.find((u) => normalizeCpf(u.cpf) === cleanCpfInput);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }
}

export const DB_DEFAULT_STICKERS: StickerDefinition[] = [
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: `Figurinha Meta ${(i % 6) + 1} - #${i + 1}`,
    rarity: 'regular' as StickerRarity,
    page: (i < 6 ? 'trabalho' : 'evolucao') as 'trabalho' | 'evolucao',
    image: `/assets/images/sticker_${i + 1}.webp`
  })),
  { id: 13, name: 'Celso Paredão', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_13.webp' },
  { id: 14, name: 'Speak Up', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_14.webp' },
  { id: 15, name: 'Lampião', rarity: 'lendaria', page: 'hall', image: '/assets/images/sticker_15.webp' },
  { id: 16, name: 'Mãos Limpas', rarity: 'lendaria', page: 'hall', image: '/assets/images/sticker_16.webp' },
  { id: 17, name: 'Suprema Bola de Ouro', rarity: 'suprema', page: 'hall', image: '/assets/images/sticker_17.webp' },
  { id: 18, name: 'Celso Paredão Especial', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_18.webp' }
];

// Helper to prevent database queries from hanging indefinitely if network/firewall/CORS is failing
const SUPABASE_TIMEOUT_MS = 12000;
const USERS_CACHE_TTL_MS = 180_000;
const STICKERS_CACHE_TTL_MS = 120_000;
const MARKET_CACHE_TTL_MS = 45_000;
const MAX_USERS_FETCH_ROWS = 2000;
const USERS_QUERY_TIMEOUT_MS = 15000;
const MAX_MARKET_LISTINGS = 100;

let usersMemoryCache: User[] | null = null;
let usersMemoryFetchedAt = 0;
let stickersMemoryCache: StickerDefinition[] | null = null;
let stickersMemoryFetchedAt = 0;
const marketMemoryCache = new Map<string, { fetchedAt: number; listings: StickerMarketListing[] }>();

function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs = SUPABASE_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Conexão com Supabase demorou mais de ${timeoutMs / 1000}s. O app vai continuar usando o cache local para não travar.`));
    }, timeoutMs);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}


export async function dbPingSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabaseClient) return false;

  try {
    const { data, error } = await promiseWithTimeout(
      supabaseClient.rpc('husf_ping') as any,
      7000
    ) as any;

    if (error) throw error;
    lastSupabaseError = null;
    return data === 'ok';
  } catch (err: any) {
    // Se o SQL novo ainda não foi rodado, não transforma a ausência do ping em erro principal do app.
    const message = String(err?.message || err || '');
    if (message.toLowerCase().includes('husf_ping') || message.toLowerCase().includes('function')) {
      return false;
    }
    lastSupabaseError = message;
    return false;
  }
}

function isCacheFresh(fetchedAt: number, ttl: number) {
  return fetchedAt > 0 && (Date.now() - fetchedAt) < ttl;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function setUsersCache(users: User[]) {
  usersMemoryCache = cloneJson(users);
  usersMemoryFetchedAt = Date.now();
}

function setStickersCache(stickers: StickerDefinition[]) {
  stickersMemoryCache = cloneJson(stickers);
  stickersMemoryFetchedAt = Date.now();
}

function formatCpfFromDigits(digits: string): string {
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function cpfSearchVariants(cpf: string): string[] {
  const clean = normalizeCpf(cpf);
  const values = new Set<string>();
  if (cpf) values.add(String(cpf).trim());
  if (clean) {
    values.add(clean);
    values.add(formatCpfFromDigits(clean));
  }
  return [...values].filter(Boolean);
}

// Helper para estabelecer conexões Realtime com as tabelas do Supabase
export function subscribeToUsers(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  return supabaseClient
    .channel('husf_users_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'husf_users' },
      (payload) => {
        console.log('Realtime husf_users recebido:', payload);
        onUpdate(payload);
      }
    )
    .subscribe((status) => console.log('Status realtime husf_users:', status));
}

export function subscribeToStickers(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  return supabaseClient
    .channel('husf_stickers_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'husf_stickers' },
      (payload) => {
        console.log('Realtime husf_stickers recebido:', payload);
        onUpdate(payload);
      }
    )
    .subscribe((status) => console.log('Status realtime husf_stickers:', status));
}

export function subscribeToSettings(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  return supabaseClient
    .channel('husf_settings_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'husf_settings' },
      (payload) => {
        console.log('Realtime husf_settings recebido:', payload);
        onUpdate(payload);
      }
    )
    .subscribe((status) => console.log('Status realtime husf_settings:', status));
}

// ────────────────────────────────────────────────────────────────────────
// USERS SYNCHRONIZATION HELPERS
// ────────────────────────────────────────────────────────────────────────

export async function dbGetUsers(options: { force?: boolean; maxRows?: number } = {}): Promise<User[]> {
  const getLocalBackup = (): User[] => {
    const local = localStorage.getItem('husf_users');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          // Filter out elements that are null or lack a cpf attribute
          const safeParsed = parsed.filter((u: any) => u && typeof u === 'object' && u.cpf);
          
          let updated = false;
          const merged = [...safeParsed];
          
          // Verify each default user is present in local cache
          DB_DEFAULT_USERS.forEach(du => {
            const cleanDuCpf = du.cpf.replace(/\D/g, '');
            if (!merged.some(mu => mu && mu.cpf && mu.cpf.replace(/\D/g, '') === cleanDuCpf)) {
              merged.push(du);
              updated = true;
            }
          });

          const updatedParsed = merged.map(u => {
            const cleanCpf = u.cpf.replace(/\D/g, '');
            if (cleanCpf === '13683235616') {
              if (u.name !== 'Thalis Alves Ramos' || u.sector !== 'Diretoria de Ensino e Pesquisa' || !u.isAdmin) {
                updated = true;
                return { ...u, name: 'Thalis Alves Ramos', sector: 'Diretoria de Ensino e Pesquisa', isAdmin: true };
              }
            }
            if (cleanCpf === '11111111111') {
              if (!u.isAdmin) {
                updated = true;
                return { ...u, isAdmin: true };
              }
            }
            return u;
          });

          if (updated) {
            localStorage.setItem('husf_users', JSON.stringify(updatedParsed));
            return updatedParsed;
          }
          return safeParsed;
        }
      } catch { }
    }
    localStorage.setItem('husf_users', JSON.stringify(DB_DEFAULT_USERS));
    return DB_DEFAULT_USERS;
  };

  if (!options.force && usersMemoryCache && isCacheFresh(usersMemoryFetchedAt, USERS_CACHE_TTL_MS)) {
    return cloneJson(usersMemoryCache);
  }

  if (!isSupabaseConfigured || !supabaseClient) {
    const localBackup = getLocalBackup();
    setUsersCache(localBackup);
    return localBackup;
  }

  try {
    let allData: any[] = [];
    let page = 0;
    const maxRows = Math.max(50, Math.min(options.maxRows || MAX_USERS_FETCH_ROWS, MAX_USERS_FETCH_ROWS));
    // Busca paginada: permite acompanhar todos os 1.238+ colaboradores sem travar a tela.
    const pageSize = Math.min(500, maxRows);
    let hasMore = true;

    while (hasMore && allData.length < maxRows) {
      const from = page * pageSize;
      const to = Math.min((page + 1) * pageSize - 1, maxRows - 1);
      const { data, error } = await promiseWithTimeout(
        supabaseClient
          .from('husf_users')
          .select('cpf,name,sector,coins,stickers,progress,is_admin,updated_at')
          .order('name', { ascending: true })
          .range(from, to) as any,
        USERS_QUERY_TIMEOUT_MS
      ) as any;

      if (error) throw error;

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        if (data.length < pageSize || allData.length >= maxRows) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    // Clear last error on successful retrieval
    lastSupabaseError = null;

    if (allData.length > 0) {
      // Filter out records from supabase that don't have a valid cpf field
      let parsed: User[] = allData
        .filter((u: any) => u && typeof u === 'object' && u.cpf)
        .map(mapSupabaseUserRow)
        .map(preferLocalIfNewer);

      // Ensure all DB_DEFAULT_USERS are present in the list returned to the app
      let remoteUpdated = false;
      DB_DEFAULT_USERS.forEach(du => {
        const cleanDuCpf = du.cpf.replace(/\D/g, '');
        const matchIndex = parsed.findIndex(p => p.cpf.replace(/\D/g, '') === cleanDuCpf);
        if (matchIndex === -1) {
          parsed.push(du);
          // Proactively upsert to Supabase in background so they exist
          dbSaveSingleUser(du);
          remoteUpdated = true;
        } else {
          // Enforce admin flag
          if (cleanDuCpf === '11111111111' || cleanDuCpf === '13683235616') {
            if (!parsed[matchIndex].isAdmin) {
              parsed[matchIndex].isAdmin = true;
              dbSaveSingleUser(parsed[matchIndex]);
              remoteUpdated = true;
            }
          }
        }
      });

      // Keep local sync updated
      localStorage.setItem('husf_users', JSON.stringify(parsed));
      setUsersCache(parsed);
      return parsed;
    } else {
      // Seed default users to remote DB
      await dbSaveUsers(DB_DEFAULT_USERS);
      setUsersCache(DB_DEFAULT_USERS);
      return DB_DEFAULT_USERS;
    }
  } catch (err) {
    lastSupabaseError = err instanceof Error ? err.message : String(err);
    console.warn('Supabase users query failed, loading from local storage backup:', err);
    const localBackup = getLocalBackup();
    setUsersCache(localBackup);
    return localBackup;
  }
}

export async function dbSaveUsers(users: User[]): Promise<void> {
  // Always update local storage first so offline experience continues immediately
  localStorage.setItem('husf_users', JSON.stringify(users));

  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    const payloads = users.map((u) => ({
      cpf: u.cpf,
      name: u.name,
      sector: u.sector,
      coins: u.coins,
      stickers: u.stickers,
      progress: embedActivityLogInProgress(u),
      is_admin: !!u.isAdmin,
      updated_at: u.updatedAt || new Date().toISOString()
    }));

    usersMemoryCache = null;
    usersMemoryFetchedAt = 0;

    const { error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_users')
        .upsert(payloads, { onConflict: 'cpf' }) as any
    ) as any;

    if (error) throw error;
  } catch (err) {
    console.error('Failed to sync users to Supabase:', err);
  }
}

export async function dbSaveSingleUser(user: User): Promise<void> {
  // Update local storage without querying Supabase first. This avoids a 30s wait when the cloud is slow.
  try {
    const raw = localStorage.getItem('husf_users');
    const parsed = raw ? JSON.parse(raw) : DB_DEFAULT_USERS;
    const localUsers: User[] = Array.isArray(parsed) ? parsed : DB_DEFAULT_USERS;
    const index = localUsers.findIndex(u => normalizeCpf(u.cpf) === normalizeCpf(user.cpf));
    if (index !== -1) {
      localUsers[index] = user;
    } else {
      localUsers.push(user);
    }
    localStorage.setItem('husf_users', JSON.stringify(localUsers));
  } catch {
    localStorage.setItem('husf_users', JSON.stringify([user]));
  }

  setUsersCache((() => {
    try {
      const raw = localStorage.getItem('husf_users');
      const parsed = raw ? JSON.parse(raw) : [user];
      return Array.isArray(parsed) ? parsed : [user];
    } catch {
      return [user];
    }
  })());

  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    const { error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_users')
        .upsert({
          cpf: user.cpf,
          name: user.name,
          sector: user.sector,
          coins: user.coins,
          stickers: user.stickers,
          progress: embedActivityLogInProgress(user),
          is_admin: !!user.isAdmin,
          updated_at: user.updatedAt || new Date().toISOString()
        }, { onConflict: 'cpf' }) as any,
      8000
    ) as any;

    if (error) throw error;
    lastSupabaseError = null;
  } catch (err) {
    // O usuário já foi salvo no cache local acima. Não travamos a tela quando a nuvem está lenta.
    lastSupabaseError = err instanceof Error ? err.message : String(err);
    console.warn(`Sincronização em nuvem lenta/falhou para o usuário ${user.cpf}; mantendo cache local:`, err);
  }
}

export async function dbDeleteUser(cpf: string): Promise<void> {
  const current = await dbGetUsers();
  const updated = current.filter(u => u.cpf !== cpf);
  localStorage.setItem('husf_users', JSON.stringify(updated));
  setUsersCache(updated);

  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    const { error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_users')
        .delete()
        .eq('cpf', cpf) as any
    ) as any;

    if (error) throw error;
  } catch (err) {
    console.error(`Failed to delete user ${cpf} from Supabase:`, err);
    throw err;
  }
}

// ────────────────────────────────────────────────────────────────────────
// SHARED SETTINGS SYNCHRONIZATION HELPERS
// ────────────────────────────────────────────────────────────────────────

export async function dbGetReleasedMetas(): Promise<number[]> {
  const getLocal = (): number[] => {
    const stored = localStorage.getItem('husf_released_metas');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
      } catch {}
    }
    return [1, 2, 3, 4, 5, 6];
  };

  if (!isSupabaseConfigured || !supabaseClient) {
    return getLocal();
  }

  try {
    const { data, error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_settings')
        .select('value')
        .eq('key', 'released_metas')
        .maybeSingle() as any,
      15000
    ) as any;

    if (error) throw error;

    let metas: number[];
    if (Array.isArray(data?.value)) {
      metas = data.value.map(Number).filter(Boolean);
    } else if (Array.isArray(data?.value?.metas)) {
      metas = data.value.metas.map(Number).filter(Boolean);
    } else {
      metas = [1, 2, 3, 4, 5, 6];
      await dbSaveReleasedMetas(metas);
    }

    localStorage.setItem('husf_released_metas', JSON.stringify(metas));
    return metas;
  } catch (err) {
    console.warn('Supabase settings query failed, loading released metas from local storage:', err);
    return getLocal();
  }
}

export async function dbSaveReleasedMetas(metas: number[]): Promise<void> {
  const cleanMetas = [...new Set(metas.map(Number).filter(Boolean))].sort((a, b) => a - b);
  localStorage.setItem('husf_released_metas', JSON.stringify(cleanMetas));

  if (!isSupabaseConfigured || !supabaseClient) return;

  const { error } = await promiseWithTimeout(
    supabaseClient
      .from('husf_settings')
      .upsert({
        key: 'released_metas',
        value: cleanMetas,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' }) as any
  ) as any;

  if (error) {
    console.error('Failed to sync released metas to Supabase:', error);
    throw error;
  }
}


// ────────────────────────────────────────────────────────────────────────
// STICKERS CATALOG SYNCHRONIZATION HELPERS
// ────────────────────────────────────────────────────────────────────────

function getDefaultStickerImagePath(id: number): string | undefined {
  return id <= 18 ? `/assets/images/sticker_${id}.webp` : undefined;
}

function normalizeStickerImagePath(id: number, image?: string | null): string | undefined {
  const fallback = getDefaultStickerImagePath(id);
  if (!image || !image.trim()) return fallback;

  let clean = image.trim().replace('/src/assets/', '/assets/');

  if (clean.startsWith('data:') || clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  if (!clean.startsWith('/')) {
    clean = `/assets/images/${clean}`;
  }

  if (/\.(png|jpg|jpeg)$/i.test(clean) && clean.includes('/assets/images/sticker_')) {
    clean = clean.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  }

  return clean || fallback;
}

function normalizeStickerImageForDatabase(id: number, image?: string | null): string | null {
  const normalized = normalizeStickerImagePath(id, image);

  // Nunca salve base64 no Supabase. Isso deixa as consultas lentas e pode travar o app no celular.
  // Para as figurinhas padrão, usamos arquivos leves em /public/assets/images.
  if (!normalized || normalized.startsWith('data:')) {
    return getDefaultStickerImagePath(id) || null;
  }

  return normalized;
}

function trySetLocalCatalog(catalog: StickerDefinition[]) {
  try {
    localStorage.setItem('husf_sticker_catalog', JSON.stringify(catalog));
  } catch (e) {
    console.warn('Falha ao gravar catálogo de figurinhas no localStorage (cota excedida). Salvando versão compactada sem imagens base64.');
    const stripped = catalog.map(s => {
      const { image, ...sWithoutImg } = s;
      if (s.id <= 18) {
        return { ...s, image: `/assets/images/sticker_${s.id}.webp` };
      }
      return sWithoutImg;
    });
    try {
      localStorage.setItem('husf_sticker_catalog', JSON.stringify(stripped));
    } catch (innerErr) {
      console.error('Falha crítica ao gravar catálogo mesmo compactado:', innerErr);
    }
  }
}

export async function dbGetStickers(options: { force?: boolean } = {}): Promise<StickerDefinition[]> {
  const getLocalCatalog = (): StickerDefinition[] => {
    const local = localStorage.getItem('husf_sticker_catalog');
    if (local) {
      try {
        const parsed = JSON.parse(local) as StickerDefinition[];
        return parsed.map(s => {
          if (!s.page) {
            if (s.id >= 1 && s.id <= 6) s.page = 'trabalho';
            else if (s.id >= 7 && s.id <= 12) s.page = 'evolucao';
            else s.page = 'hall';
          }
          return s;
        });
      } catch { }
    }
    const seeded: StickerDefinition[] = DB_DEFAULT_STICKERS.map(s => {
      const page: 'trabalho' | 'evolucao' | 'hall' = s.id >= 1 && s.id <= 6 ? 'trabalho' : s.id >= 7 && s.id <= 12 ? 'evolucao' : 'hall';
      return { ...s, page, image: normalizeStickerImagePath(s.id, s.image) };
    });
    trySetLocalCatalog(seeded);
    return seeded;
  };

  if (!options.force && stickersMemoryCache && isCacheFresh(stickersMemoryFetchedAt, STICKERS_CACHE_TTL_MS)) {
    return cloneJson(stickersMemoryCache);
  }

  if (!isSupabaseConfigured || !supabaseClient) {
    const localCatalog = getLocalCatalog();
    setStickersCache(localCatalog);
    return localCatalog;
  }

  try {
    // Busca principal SEM a coluna image.
    // Se existirem imagens antigas em base64 no banco, trazer essa coluna pode estourar o tempo de resposta.
    const { data, error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_stickers')
        .select('id,name,rarity')
        .order('id', { ascending: true }) as any,
      15000
    ) as any;

    if (error) throw error;

    if (data && data.length > 0) {
      const imageById = new Map<number, string>();

      // Tenta carregar somente imagens externas/caminhos de figurinhas personalizadas.
      // Base64 é ignorado de propósito para não travar o app.
      try {
        const { data: customImages } = await promiseWithTimeout(
          supabaseClient
            .from('husf_stickers')
            .select('id,image')
            .not('image', 'is', null)
            .not('image', 'like', 'data:%')
            .limit(300) as any,
          8000
        ) as any;

        (customImages || []).forEach((row: any) => {
          if (row?.id && row?.image) imageById.set(Number(row.id), String(row.image));
        });
      } catch (imageErr) {
        console.warn('Não foi possível carregar imagens personalizadas; usando catálogo leve:', imageErr);
      }

      const parsed: StickerDefinition[] = data.map((s) => {
        let parsedRarity = s.rarity || 'regular';
        let parsedPage: 'trabalho' | 'evolucao' | 'hall' | undefined = undefined;
        if (parsedRarity.includes(':')) {
          const parts = parsedRarity.split(':');
          parsedPage = parts[0] as any;
          parsedRarity = parts[1];
        } else {
          // Fallback based on ID to support legacy database records seamlessly
          const idNum = s.id;
          if (idNum >= 1 && idNum <= 6) parsedPage = 'trabalho';
          else if (idNum >= 7 && idNum <= 12) parsedPage = 'evolucao';
          else parsedPage = 'hall';
        }
        return {
          id: s.id,
          name: s.name,
          rarity: parsedRarity as StickerRarity,
          image: normalizeStickerImagePath(s.id, imageById.get(Number(s.id))),
          page: parsedPage
        };
      });
      trySetLocalCatalog(parsed);
      setStickersCache(parsed);
      return parsed;
    } else {
      // Seed remote table since it has empty rows
      await dbSaveWholeCatalog(DB_DEFAULT_STICKERS);
      setStickersCache(DB_DEFAULT_STICKERS);
      return DB_DEFAULT_STICKERS;
    }
  } catch (err) {
    console.warn('Supabase stickers query failed, loading from local storage backup:', err);
    const localCatalog = getLocalCatalog();
    setStickersCache(localCatalog);
    return localCatalog;
  }
}

export async function dbSaveWholeCatalog(stickers: StickerDefinition[]): Promise<void> {
  const parsedStickers = stickers.map(s => {
    if (!s.page) {
      s.page = s.id >= 1 && s.id <= 6 ? 'trabalho' : s.id >= 7 && s.id <= 12 ? 'evolucao' : 'hall';
    }
    return s;
  });
  trySetLocalCatalog(parsedStickers);
  setStickersCache(parsedStickers);

  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    const payloads = parsedStickers.map((s) => ({
      id: s.id,
      name: s.name,
      rarity: `${s.page}:${s.rarity}`,
      image: normalizeStickerImageForDatabase(s.id, s.image)
    }));

    // Perform massive upsert or block inserts
    const { error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_stickers')
        .upsert(payloads, { onConflict: 'id' }) as any
    ) as any;

    if (error) throw error;
  } catch (err) {
    console.error('Failed to sync sticker catalog to Supabase:', err);
  }
}

export async function dbInsertSticker(sticker: StickerDefinition): Promise<void> {
  const pageVal = sticker.page || (sticker.id >= 1 && sticker.id <= 6 ? 'trabalho' : sticker.id >= 7 && sticker.id <= 12 ? 'evolucao' : 'hall');
  
  // If Supabase is configured, do the remote insert first to verify
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { error } = await promiseWithTimeout(
        supabaseClient
          .from('husf_stickers')
          .insert({
            id: sticker.id,
            name: sticker.name,
            rarity: `${pageVal}:${sticker.rarity}`,
            image: normalizeStickerImageForDatabase(sticker.id, sticker.image)
          }) as any
      ) as any;

      if (error) throw error;
    } catch (err) {
      console.error('Failed to insert new sticker on Supabase:', err);
      throw err;
    }
  }

  // Update local storage only if remote succeeded (or if Supabase is not configured)
  const current = await dbGetStickers();
  if (!current.some(s => s.id === sticker.id)) {
    current.push({ ...sticker, page: pageVal });
  }
  trySetLocalCatalog(current);
  setStickersCache(current);
}

export async function dbUpdateSticker(sticker: StickerDefinition): Promise<void> {
  const pageVal = sticker.page || (sticker.id >= 1 && sticker.id <= 6 ? 'trabalho' : sticker.id >= 7 && sticker.id <= 12 ? 'evolucao' : 'hall');
  
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { error } = await promiseWithTimeout(
        supabaseClient
          .from('husf_stickers')
          .upsert({
            id: sticker.id,
            name: sticker.name,
            rarity: `${pageVal}:${sticker.rarity}`,
            image: normalizeStickerImageForDatabase(sticker.id, sticker.image)
          }, { onConflict: 'id' }) as any
      ) as any;

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update sticker on Supabase:', err);
      throw err;
    }
  }

  const current = await dbGetStickers();
  const updated = current.map(s => s.id === sticker.id ? { ...sticker, page: pageVal } : s);
  
  if (!current.some(s => s.id === sticker.id)) {
    updated.push({ ...sticker, page: pageVal });
  }
  
  trySetLocalCatalog(updated);
  setStickersCache(updated);
}

export async function dbDeleteSticker(id: number): Promise<void> {
  // If Supabase is configured, delete from remote first
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { error } = await promiseWithTimeout(
        supabaseClient
          .from('husf_stickers')
          .delete()
          .eq('id', id) as any
      ) as any;

      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete sticker from Supabase:', err);
      throw err;
    }
  }

  // Update local storage only if remote succeeded (or of Supabase is not configured)
  const current = await dbGetStickers();
  const updated = current.filter(s => s.id !== id);
  trySetLocalCatalog(updated);
  setStickersCache(updated);
}


// ────────────────────────────────────────────────────────────────────────
// P2P TRADES SYNCHRONIZATION HELPERS
// ────────────────────────────────────────────────────────────────────────

export interface TradeSessionModel {
  id: string;
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

export async function dbGetTrade(id: string): Promise<TradeSessionModel | null> {
  if (!isSupabaseConfigured || !supabaseClient) {
    const local = localStorage.getItem(`celso_trade_${id}`);
    return local ? JSON.parse(local) : null;
  }

  try {
    const { data, error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_trades')
        .select('*')
        .eq('id', id)
        .single() as any,
      15000
    ) as any;

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    if (!data) return null;

    const formatted: TradeSessionModel = {
      id: data.id,
      initiator: {
        userId: data.initiator_user_id,
        userName: data.initiator_user_name,
        stickerId: data.initiator_sticker_id,
        confirmed: !!data.initiator_confirmed
      },
      receiver: data.receiver_user_id ? {
        userId: data.receiver_user_id,
        userName: data.receiver_user_name || '',
        stickerId: data.receiver_sticker_id || 0,
        confirmed: !!data.receiver_confirmed
      } : undefined,
      status: data.status as any,
      expiresAt: Number(data.expires_at)
    };

    return formatted;
  } catch (err) {
    console.warn('Failed to query trade session from Supabase, loading from cache:', err);
    const local = localStorage.getItem(`celso_trade_${id}`);
    return local ? JSON.parse(local) : null;
  }
}

export async function dbUpsertTrade(trade: TradeSessionModel): Promise<void> {
  localStorage.setItem(`celso_trade_${trade.id}`, JSON.stringify(trade));

  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    const payload = {
      id: trade.id,
      initiator_user_id: trade.initiator.userId,
      initiator_user_name: trade.initiator.userName,
      initiator_sticker_id: trade.initiator.stickerId,
      initiator_confirmed: !!trade.initiator.confirmed,
      receiver_user_id: trade.receiver?.userId || null,
      receiver_user_name: trade.receiver?.userName || null,
      receiver_sticker_id: trade.receiver?.stickerId || null,
      receiver_confirmed: !!trade.receiver?.confirmed,
      status: trade.status,
      expires_at: trade.expiresAt
    };

    const { error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_trades')
        .upsert(payload, { onConflict: 'id' }) as any,
      15000
    ) as any;

    if (error) throw error;
  } catch (err) {
    console.error('Failed to upsert trade session on Supabase:', err);
  }
}

// ────────────────────────────────────────────────────────────────────────
// STICKER MARKETPLACE HELPERS
// ────────────────────────────────────────────────────────────────────────

export interface StickerMarketListing {
  id: string;
  sellerCpf: string;
  sellerName: string;
  stickerId: number;
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  buyerCpf?: string | null;
  createdAt: string;
  soldAt?: string | null;
}

function mapMarketListingRow(row: any): StickerMarketListing {
  return {
    id: String(row?.id || ''),
    sellerCpf: String(row?.seller_cpf || row?.sellerCpf || ''),
    sellerName: String(row?.seller_name || row?.sellerName || 'Colaborador'),
    stickerId: Number(row?.sticker_id || row?.stickerId || 0),
    price: Number(row?.price || 0),
    status: (row?.status || 'active') as StickerMarketListing['status'],
    buyerCpf: row?.buyer_cpf || row?.buyerCpf || null,
    createdAt: row?.created_at || row?.createdAt || new Date().toISOString(),
    soldAt: row?.sold_at || row?.soldAt || null,
  };
}

function getLocalMarketListings(): StickerMarketListing[] {
  try {
    const raw = localStorage.getItem('husf_sticker_market');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(mapMarketListingRow) : [];
  } catch {
    return [];
  }
}

function setLocalMarketListings(listings: StickerMarketListing[]) {
  try {
    localStorage.setItem('husf_sticker_market', JSON.stringify(listings.slice(0, 200)));
  } catch (err) {
    console.warn('Não foi possível salvar mercado local de figurinhas:', err);
  }
}

function removeOneStickerFromArray(stickers: number[], stickerId: number): number[] {
  const copy = [...stickers];
  const index = copy.indexOf(stickerId);
  if (index >= 0) copy.splice(index, 1);
  return copy;
}

export async function dbGetMarketListings(status: 'active' | 'sold' | 'cancelled' | 'all' = 'active', options: { force?: boolean; limit?: number } = {}): Promise<StickerMarketListing[]> {
  const limit = Math.max(20, Math.min(options.limit || MAX_MARKET_LISTINGS, MAX_MARKET_LISTINGS));
  const cacheKey = `${status}:${limit}`;
  const cached = marketMemoryCache.get(cacheKey);
  if (!options.force && cached && isCacheFresh(cached.fetchedAt, MARKET_CACHE_TTL_MS)) {
    return cloneJson(cached.listings);
  }

  if (!isSupabaseConfigured || !supabaseClient) {
    const local = getLocalMarketListings()
      .filter(listing => status === 'all' || listing.status === status)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit);
    marketMemoryCache.set(cacheKey, { fetchedAt: Date.now(), listings: cloneJson(local) });
    return local;
  }

  try {
    let query = supabaseClient
      .from('husf_sticker_market')
      .select('id,seller_cpf,seller_name,sticker_id,price,status,buyer_cpf,created_at,sold_at')
      .order('created_at', { ascending: false })
      .limit(limit) as any;

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await promiseWithTimeout(query, 15000) as any;
    if (error) throw error;

    const listings = (data || []).map(mapMarketListingRow).slice(0, limit);
    setLocalMarketListings(listings);
    marketMemoryCache.set(cacheKey, { fetchedAt: Date.now(), listings: cloneJson(listings) });
    return listings;
  } catch (err) {
    console.warn('Falha ao consultar mercado no Supabase, usando cache local:', err);
    const local = getLocalMarketListings()
      .filter(listing => status === 'all' || listing.status === status)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit);
    marketMemoryCache.set(cacheKey, { fetchedAt: Date.now(), listings: cloneJson(local) });
    return local;
  }
}

export async function dbCreateMarketListing(seller: User, stickerId: number, price: number): Promise<StickerMarketListing> {
  marketMemoryCache.clear();
  const normalizedPrice = Math.round(Number(price));
  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 10 || normalizedPrice > 300) {
    throw new Error('O preço precisa ficar entre 10 e 300 moedas.');
  }

  const ownedCount = (seller.stickers || []).filter(id => Number(id) === Number(stickerId)).length;
  if (ownedCount <= 1) {
    throw new Error('Você só pode vender figurinhas repetidas. A última unidade fica protegida no álbum.');
  }

  const sticker = getStickerById(stickerId);
  if (sticker?.rarity === 'suprema') {
    throw new Error('A figurinha Suprema é extremamente rara e não pode ser vendida no mercado. Ela só sai no Pacote Grandes Finais ou pelo Admin.');
  }

  if (isSupabaseConfigured && supabaseClient) {
    const { data, error } = await promiseWithTimeout(
      supabaseClient.rpc('husf_create_market_listing', {
        p_seller_cpf: seller.cpf,
        p_sticker_id: stickerId,
        p_price: normalizedPrice
      }) as any,
      15000
    ) as any;

    if (error) throw error;
    return mapMarketListingRow(Array.isArray(data) ? data[0] : data);
  }

  const listing: StickerMarketListing = {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sellerCpf: seller.cpf,
    sellerName: seller.name,
    stickerId,
    price: normalizedPrice,
    status: 'active',
    buyerCpf: null,
    createdAt: new Date().toISOString(),
    soldAt: null,
  };

  const updatedSeller: User = {
    ...seller,
    stickers: removeOneStickerFromArray(seller.stickers || [], stickerId),
    updatedAt: new Date().toISOString()
  };

  await dbSaveSingleUser(updatedSeller);
  setLocalMarketListings([listing, ...getLocalMarketListings()]);
  return listing;
}

export async function dbBuyMarketListing(listingId: string, buyer: User): Promise<StickerMarketListing> {
  marketMemoryCache.clear();
  if (isSupabaseConfigured && supabaseClient) {
    const { data: listingRow } = await promiseWithTimeout(
      supabaseClient
        .from('husf_sticker_market')
        .select('sticker_id,status')
        .eq('id', listingId)
        .maybeSingle() as any,
      15000
    ) as any;

    if (listingRow) {
      if (listingRow.status !== 'active') throw new Error('Essa figurinha não está mais disponível.');
      const sticker = getStickerById(Number(listingRow.sticker_id));
      if (sticker?.rarity === 'suprema') {
        throw new Error('A figurinha Suprema não pode ser comprada diretamente no mercado. Ela só sai no Pacote Grandes Finais ou pelo Admin.');
      }
    }

    const { data, error } = await promiseWithTimeout(
      supabaseClient.rpc('husf_buy_market_listing', {
        p_listing_id: listingId,
        p_buyer_cpf: buyer.cpf
      }) as any,
      15000
    ) as any;

    if (error) throw error;
    return mapMarketListingRow(Array.isArray(data) ? data[0] : data);
  }

  const listings = getLocalMarketListings();
  const listing = listings.find(item => item.id === listingId);
  if (!listing || listing.status !== 'active') throw new Error('Essa figurinha não está mais disponível.');
  if (listing.sellerCpf === buyer.cpf) throw new Error('Você não pode comprar seu próprio anúncio.');

  const sticker = getStickerById(listing.stickerId);
  if (sticker?.rarity === 'suprema') {
    throw new Error('A figurinha Suprema não pode ser comprada diretamente no mercado. Ela só sai no Pacote Grandes Finais ou pelo Admin.');
  }

  if ((buyer.coins || 0) < listing.price) throw new Error('Saldo insuficiente para comprar essa figurinha.');

  const seller = await dbFindUserByCpf(listing.sellerCpf);
  if (!seller) throw new Error('Vendedor não encontrado.');

  const updatedBuyer: User = {
    ...buyer,
    coins: buyer.coins - listing.price,
    stickers: [...(buyer.stickers || []), listing.stickerId],
    updatedAt: new Date().toISOString()
  };

  const updatedSeller: User = {
    ...seller,
    coins: (seller.coins || 0) + listing.price,
    updatedAt: new Date().toISOString()
  };

  await dbSaveSingleUser(updatedSeller);
  await dbSaveSingleUser(updatedBuyer);

  const sold: StickerMarketListing = {
    ...listing,
    status: 'sold',
    buyerCpf: buyer.cpf,
    soldAt: new Date().toISOString()
  };

  setLocalMarketListings(listings.map(item => item.id === listingId ? sold : item));
  return sold;
}

export async function dbCancelMarketListing(listingId: string, sellerCpf: string): Promise<StickerMarketListing> {
  marketMemoryCache.clear();
  if (isSupabaseConfigured && supabaseClient) {
    const { data, error } = await promiseWithTimeout(
      supabaseClient.rpc('husf_cancel_market_listing', {
        p_listing_id: listingId,
        p_seller_cpf: sellerCpf
      }) as any,
      15000
    ) as any;

    if (error) throw error;
    return mapMarketListingRow(Array.isArray(data) ? data[0] : data);
  }

  const listings = getLocalMarketListings();
  const listing = listings.find(item => item.id === listingId);
  if (!listing || listing.status !== 'active') throw new Error('Esse anúncio não está mais ativo.');
  if (listing.sellerCpf !== sellerCpf) throw new Error('Você só pode cancelar seus próprios anúncios.');

  const seller = await dbFindUserByCpf(sellerCpf);
  if (!seller) throw new Error('Vendedor não encontrado.');

  const updatedSeller: User = {
    ...seller,
    stickers: [...(seller.stickers || []), listing.stickerId],
    updatedAt: new Date().toISOString()
  };
  await dbSaveSingleUser(updatedSeller);

  const cancelled: StickerMarketListing = {
    ...listing,
    status: 'cancelled'
  };

  setLocalMarketListings(listings.map(item => item.id === listingId ? cancelled : item));
  return cancelled;
}

export function subscribeToMarket(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  return supabaseClient
    .channel('husf_sticker_market_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'husf_sticker_market' },
      (payload) => {
        console.log('Realtime husf_sticker_market recebido:', payload);
        onUpdate(payload);
      }
    )
    .subscribe((status) => console.log('Status realtime husf_sticker_market:', status));
}
