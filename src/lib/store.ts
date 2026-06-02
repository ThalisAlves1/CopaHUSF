export type StickerRarity = 'regular' | 'holografica' | 'lendaria' | 'suprema';

export interface StickerDefinition {
  id: number;
  name: string;
  rarity: StickerRarity;
  image?: string;
  page?: 'trabalho' | 'evolucao' | 'hall';
}

// Fixed constant sticker catalog to completely avoid localStorage storage limit exceeded failures
export const STATIC_STICKERS: StickerDefinition[] = [
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: `Figurinha Meta ${(i % 6) + 1} - #${i + 1}`,
    rarity: 'regular' as StickerRarity,
    page: (i < 6 ? 'trabalho' : 'evolucao') as 'trabalho' | 'evolucao' | 'hall',
    image: `/assets/images/sticker_${i + 1}.png`
  })),
  { id: 13, name: 'Celso Paredão', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_13.png' },
  { id: 14, name: 'Speak Up', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_14.png' },
  { id: 15, name: 'Lampião', rarity: 'lendaria', page: 'hall', image: '/assets/images/sticker_15.png' },
  { id: 16, name: 'Mãos Limpas', rarity: 'lendaria', page: 'hall', image: '/assets/images/sticker_16.png' },
  { id: 17, name: 'Suprema Bola de Ouro', rarity: 'suprema', page: 'hall', image: '/assets/images/sticker_17.png' }
];

// Get stickers from localStorage, with predefined initial values
export function getStoredStickers(): StickerDefinition[] {
  const data = localStorage.getItem('husf_sticker_catalog');
  if (data) {
    try {
      const parsed = JSON.parse(data) as StickerDefinition[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(s => {
          if (!s.page) {
            if (s.id >= 1 && s.id <= 6) s.page = 'trabalho';
            else if (s.id >= 7 && s.id <= 12) s.page = 'evolucao';
            else s.page = 'hall';
          }
          if (s.image && s.image.startsWith('/src/assets/')) {
            s.image = s.image.replace('/src/assets/', '/');
          }
          if (!s.image && s.id <= 17) {
            s.image = `/assets/images/sticker_${s.id}.png`;
          }
          return s;
        });
      }
    } catch (e) {
      console.error('Falha ao ler catálogo de figurinhas do LocalStorage:', e);
    }
  }

  // Pre-seed catalog if empty or invalid
  try {
    localStorage.setItem('husf_sticker_catalog', JSON.stringify(STATIC_STICKERS));
  } catch (e) {
    console.warn('Falha ao gravar catálogo padrão no LocalStorage:', e);
  }
  return STATIC_STICKERS;
}

// Set and save the cromo catalog safely
export function saveStoredStickers(stickers: StickerDefinition[]) {
  try {
    localStorage.setItem('husf_sticker_catalog', JSON.stringify(stickers));
  } catch (e) {
    console.warn('Cota de LocalStorage excedida! Salvando catálogo de figurinhas otimizado sem imagens base64.');
    // Quota reached, filter out heavy base64 strings to safeguard user data
    const stripped = stickers.map(s => {
      const { image, ...sWithoutImg } = s;
      // Keep static references only, custom uploaded base64 gets stripped to protect storage
      if (s.id <= 17) {
        return { ...s, image: `/assets/images/sticker_${s.id}.png` };
      }
      return sWithoutImg;
    });
    try {
      localStorage.setItem('husf_sticker_catalog', JSON.stringify(stripped));
    } catch (innerErr) {
      console.error('Erro crítico ao salvar catálogo mesmo otimizado:', innerErr);
    }
  }
}


export function getStickersByRarity(rarity: StickerRarity): StickerDefinition[] {
  const allStickers = getStoredStickers();
  const list = allStickers.filter(s => s.rarity === rarity);
  if (list.length === 0) {
    // Safety fallback
    return [{ id: 9990 + (rarity === 'regular' ? 1 : rarity === 'holografica' ? 2 : rarity === 'lendaria' ? 3 : 4), name: `Cromo Coringa (${rarity.toUpperCase()})`, rarity }];
  }
  return list;
}

export const STICKER_CATALOG = {
  get regular() { return getStickersByRarity('regular'); },
  get holografica() { return getStickersByRarity('holografica'); },
  get lendaria() { return getStickersByRarity('lendaria'); },
  get suprema() { return getStickersByRarity('suprema'); }
};

export interface PackageDefinition {
  id: string;
  name: string;
  category: string;
  price: number;
  color: string;
  description: string;
  guaranteed: string;
  imageUrl?: string;
}

export const getAllStickers = () => {
  return getStoredStickers();
};

export const getStickerById = (id: number) => getAllStickers().find(s => s.id === id);

export const PACKAGES: PackageDefinition[] = [
  {
    id: 'plantao',
    name: 'Pacote do Plantão',
    category: 'Comum',
    price: 30,
    color: 'bg-emerald-500',
    description: 'Porta de entrada. Preencha a base do álbum regular.',
    guaranteed: '3 Figurinhas Regulares'
  },
  {
    id: 'elite',
    name: 'Pacote de Elite da Qualidade',
    category: 'Raro',
    price: 60,
    color: 'bg-amber-400',
    description: 'Introduz a chance de adquirir cromos holográficos.',
    guaranteed: '3 Figurinhas Mistas'
  },
  {
    id: 'reliquia',
    name: 'Pacote Relíquia Histórica',
    category: 'Lendário',
    price: 100,
    color: 'bg-fuchsia-600',
    description: 'Garante uma figurinha Lendária Retrô.',
    guaranteed: '1 Lendária + 2 Mistas'
  },
  {
    id: 'final',
    name: 'Pacote Grandes Finais',
    category: 'Premium',
    price: 150,
    color: 'bg-slate-900',
    description: 'A melhor oportunidade para caçar a Suprema Bola de Ouro.',
    guaranteed: '3 Figurinhas Mistas Premium'
  }
];

const pickRandom = (arr: StickerDefinition[]) => arr[Math.floor(Math.random() * arr.length)];

const gachaRoll = (rates: { regular: number, holografica: number, lendaria: number, suprema: number }): StickerDefinition => {
  const rand = Math.random() * 100;
  let accum = 0;
  
  accum += rates.suprema;
  if (rand <= accum) return pickRandom(STICKER_CATALOG.suprema);
  
  accum += rates.lendaria;
  if (rand <= accum) return pickRandom(STICKER_CATALOG.lendaria);
  
  accum += rates.holografica;
  if (rand <= accum) return pickRandom(STICKER_CATALOG.holografica);
  
  return pickRandom(STICKER_CATALOG.regular);
};

export const openPackage = (packageId: string): StickerDefinition[] => {
  const results: StickerDefinition[] = [];
  
  if (packageId === 'plantao') {
    // 100% regular
    for (let i = 0; i < 3; i++) {
      results.push(gachaRoll({ regular: 100, holografica: 0, lendaria: 0, suprema: 0 }));
    }
  } else if (packageId === 'elite') {
    // 80% reg, 18% holo, 1.9% lend, 0.1% sup
    for (let i = 0; i < 3; i++) {
      results.push(gachaRoll({ regular: 80, holografica: 18, lendaria: 1.9, suprema: 0.1 }));
    }
  } else if (packageId === 'reliquia') {
    // Slot 1: 100% Lendaria
    results.push(gachaRoll({ regular: 0, holografica: 0, lendaria: 100, suprema: 0 }));
    // Slot 2 and 3: 85% Reg, 14.5% Holo, 0% Lend, 0.5% Sup
    for (let i = 0; i < 2; i++) {
      results.push(gachaRoll({ regular: 85, holografica: 14.5, lendaria: 0, suprema: 0.5 }));
    }
  } else if (packageId === 'final') {
    // 45% reg, 40% holo, 12% lend, 3% sup
    for (let i = 0; i < 3; i++) {
      results.push(gachaRoll({ regular: 45, holografica: 40, lendaria: 12, suprema: 3 }));
    }
  }
  
  return results;
};

