import { createClient } from '@supabase/supabase-js';
import { User } from '../types';
import { StickerDefinition, StickerRarity } from './store';

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

function mapSupabaseUserRow(row: any): User {
  const cleanCpf = normalizeCpf(row?.cpf);
  const isThisAdmin = cleanCpf === '13683235616' || cleanCpf === '11111111111' || !!row?.is_admin;

  return {
    cpf: String(row?.cpf || ''),
    name: cleanCpf === '13683235616'
      ? 'Thalis Alves Ramos'
      : (row?.name || 'Sem Nome'),
    sector: cleanCpf === '13683235616'
      ? 'Diretoria de Ensino e Pesquisa'
      : (row?.sector || 'Outro Setor'),
    coins: typeof row?.coins === 'number' ? row.coins : Number(row?.coins || 0),
    stickers: Array.isArray(row?.stickers) ? row.stickers : [],
    progress: typeof row?.progress === 'object' && row.progress !== null ? row.progress : {},
    isAdmin: isThisAdmin
  };
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

export async function dbFindUserByCpf(cpf: string): Promise<User | null> {
  const cleanCpfInput = normalizeCpf(cpf);
  if (!cleanCpfInput) return null;

  if (isSupabaseConfigured && supabaseClient) {
    try {
      const variants = cpfSearchVariants(cpf);
      const { data, error } = await promiseWithTimeout(
        supabaseClient
          .from('husf_users')
          .select('cpf,name,sector,coins,stickers,progress,is_admin')
          .in('cpf', variants) as any
      ) as any;

      if (error) throw error;

      const row = (data || []).find((u: any) => normalizeCpf(u?.cpf) === cleanCpfInput);
      lastSupabaseError = null;

      if (!row) return null;

      const user = mapSupabaseUserRow(row);
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
const SUPABASE_TIMEOUT_MS = 30000;

function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs = SUPABASE_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Conexão com Supabase demorou mais de ${timeoutMs / 1000}s. Isso geralmente é instabilidade/cold start do Supabase, internet bloqueando a API ou uma consulta pesada.`));
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

export async function dbGetUsers(): Promise<User[]> {
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

  if (!isSupabaseConfigured || !supabaseClient) {
    return getLocalBackup();
  }

  try {
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await promiseWithTimeout(
        supabaseClient
          .from('husf_users')
          .select('cpf,name,sector,coins,stickers,progress,is_admin')
          .order('name', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1) as any
      ) as any;

      if (error) throw error;

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        if (data.length < pageSize) {
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
      const parsed: User[] = allData
        .filter((u: any) => u && typeof u === 'object' && u.cpf)
        .map(mapSupabaseUserRow);

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
      return parsed;
    } else {
      // Seed default users to remote DB
      await dbSaveUsers(DB_DEFAULT_USERS);
      return DB_DEFAULT_USERS;
    }
  } catch (err) {
    lastSupabaseError = err instanceof Error ? err.message : String(err);
    console.warn('Supabase users query failed, loading from local storage backup:', err);
    return getLocalBackup();
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
      progress: u.progress,
      is_admin: !!u.isAdmin,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseClient
      .from('husf_users')
      .upsert(payloads, { onConflict: 'cpf' });

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
          progress: user.progress,
          is_admin: !!user.isAdmin,
          updated_at: new Date().toISOString()
        }, { onConflict: 'cpf' }) as any
    ) as any;

    if (error) throw error;
    lastSupabaseError = null;
  } catch (err) {
    lastSupabaseError = err instanceof Error ? err.message : String(err);
    console.error(`Failed to sync individual user ${user.cpf} to Supabase:`, err);
    throw err;
  }
}

export async function dbDeleteUser(cpf: string): Promise<void> {
  const current = await dbGetUsers();
  const updated = current.filter(u => u.cpf !== cpf);
  localStorage.setItem('husf_users', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    const { error } = await supabaseClient
      .from('husf_users')
      .delete()
      .eq('cpf', cpf);

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

  const { error } = await supabaseClient
    .from('husf_settings')
    .upsert({
      key: 'released_metas',
      value: cleanMetas,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) {
    console.error('Failed to sync released metas to Supabase:', error);
    throw error;
  }
}


// ────────────────────────────────────────────────────────────────────────
// STICKERS CATALOG SYNCHRONIZATION HELPERS
// ────────────────────────────────────────────────────────────────────────

function normalizeStickerImagePath(id: number, image?: string | null): string | undefined {
  const fallback = id <= 18 ? `/assets/images/sticker_${id}.webp` : undefined;
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

export async function dbGetStickers(): Promise<StickerDefinition[]> {
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

  if (!isSupabaseConfigured || !supabaseClient) {
    return getLocalCatalog();
  }

  try {
    const { data, error } = await promiseWithTimeout(
      supabaseClient
        .from('husf_stickers')
        .select('id,name,rarity,image')
        .order('id', { ascending: true }) as any,
      15000
    ) as any;

    if (error) throw error;

    if (data && data.length > 0) {
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
          image: normalizeStickerImagePath(s.id, s.image),
          page: parsedPage
        };
      });
      trySetLocalCatalog(parsed);
      return parsed;
    } else {
      // Seed remote table since it has empty rows
      await dbSaveWholeCatalog(DB_DEFAULT_STICKERS);
      return DB_DEFAULT_STICKERS;
    }
  } catch (err) {
    console.warn('Supabase stickers query failed, loading from local storage backup:', err);
    return getLocalCatalog();
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

  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    const payloads = parsedStickers.map((s) => ({
      id: s.id,
      name: s.name,
      rarity: `${s.page}:${s.rarity}`,
      image: normalizeStickerImagePath(s.id, s.image) || null
    }));

    // Perform massive upsert or block inserts
    const { error } = await supabaseClient
      .from('husf_stickers')
      .upsert(payloads, { onConflict: 'id' });

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
      const { error } = await supabaseClient
        .from('husf_stickers')
        .insert({
          id: sticker.id,
          name: sticker.name,
          rarity: `${pageVal}:${sticker.rarity}`,
          image: normalizeStickerImagePath(sticker.id, sticker.image) || null
        });

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
}

export async function dbUpdateSticker(sticker: StickerDefinition): Promise<void> {
  const pageVal = sticker.page || (sticker.id >= 1 && sticker.id <= 6 ? 'trabalho' : sticker.id >= 7 && sticker.id <= 12 ? 'evolucao' : 'hall');
  
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('husf_stickers')
        .upsert({
          id: sticker.id,
          name: sticker.name,
          rarity: `${pageVal}:${sticker.rarity}`,
          image: normalizeStickerImagePath(sticker.id, sticker.image) || null
        }, { onConflict: 'id' });

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
}

export async function dbDeleteSticker(id: number): Promise<void> {
  // If Supabase is configured, delete from remote first
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('husf_stickers')
        .delete()
        .eq('id', id);

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

    const { error } = await supabaseClient
      .from('husf_trades')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  } catch (err) {
    console.error('Failed to upsert trade session on Supabase:', err);
  }
}
