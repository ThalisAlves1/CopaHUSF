import { User } from '../types';
import { dbFindUserByCpf, DB_DEFAULT_USERS } from './supabase';

// Initialize local database back-up if not present or migrate existing back-up to Thalis Alves Ramos and Ana Souza admin
const initialUsersRaw = localStorage.getItem('husf_users');
if (!initialUsersRaw) {
  localStorage.setItem('husf_users', JSON.stringify(DB_DEFAULT_USERS));
} else {
  try {
    const parsed = JSON.parse(initialUsersRaw);
    if (Array.isArray(parsed)) {
      let changed = false;
      const mutated = parsed.map(u => {
        if (!u || !u.cpf) return u;
        const cleanCpf = u.cpf.replace(/\D/g, '');
        if (cleanCpf === '13683235616') {
          if (u.name !== 'Thalis Alves Ramos' || u.sector !== 'Diretoria de Ensino e Pesquisa' || !u.isAdmin) {
            changed = true;
            return {
              ...u,
              name: 'Thalis Alves Ramos',
              sector: 'Diretoria de Ensino e Pesquisa',
              isAdmin: true
            };
          }
        }
        if (cleanCpf === '11111111111') {
          if (!u.isAdmin) {
            changed = true;
            return {
              ...u,
              isAdmin: true
            };
          }
        }
        return u;
      });
      if (changed) {
        localStorage.setItem('husf_users', JSON.stringify(mutated));
      }
    }
  } catch (err) {}
}

export function getStoredUsers(): User[] {
  const data = localStorage.getItem('husf_users');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map(u => {
          if (!u || !u.cpf) return u;
          const cleanCpf = u.cpf.replace(/\D/g, '');
          if (cleanCpf === '13683235616') {
            return {
              ...u,
              name: 'Thalis Alves Ramos',
              sector: 'Diretoria de Ensino e Pesquisa',
              isAdmin: true
            };
          }
          if (cleanCpf === '11111111111') {
            return {
              ...u,
              name: u.name || 'Ana Souza',
              sector: u.sector || 'UTI Adulto',
              isAdmin: true
            };
          }
          return u;
        });
      }
      return DB_DEFAULT_USERS;
    } catch {
      return DB_DEFAULT_USERS;
    }
  }
  return DB_DEFAULT_USERS;
}

export function saveStoredUsers(users: User[]) {
  // Salva apenas o cache local.
  // A sincronização de progresso individual é feita com dbSaveSingleUser para evitar
  // que um navegador com cache antigo sobrescreva moedas/figurinhas de outros usuários.
  localStorage.setItem('husf_users', JSON.stringify(users));
}

export const MOCK_USERS = getStoredUsers();

export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const simulateLogin = async (cpf: string): Promise<User | null> => {
  return dbFindUserByCpf(cpf);
};


