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
    image: `/assets/images/sticker_${i + 1}.webp`
  })),
  { id: 13, name: 'Celso Paredão', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_13.webp' },
  { id: 14, name: 'Speak Up', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_14.webp' },
  { id: 15, name: 'Lampião', rarity: 'lendaria', page: 'hall', image: '/assets/images/sticker_15.webp' },
  { id: 16, name: 'Mãos Limpas', rarity: 'lendaria', page: 'hall', image: '/assets/images/sticker_16.webp' },
  { id: 17, name: 'Suprema Bola de Ouro', rarity: 'suprema', page: 'hall', image: '/assets/images/sticker_17.webp' },
  { id: 18, name: 'Celso Paredão Especial', rarity: 'holografica', page: 'hall', image: '/assets/images/sticker_18.webp' }
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
          if (s.image) {
            s.image = s.image.replace('/src/assets/', '/assets/');
            if (!s.image.startsWith('data:') && !s.image.startsWith('http://') && !s.image.startsWith('https://') && !s.image.startsWith('/')) {
              s.image = `/assets/images/${s.image}`;
            }
            if (/\.(png|jpg|jpeg)$/i.test(s.image) && s.image.includes('/assets/images/sticker_')) {
              s.image = s.image.replace(/\.(png|jpg|jpeg)$/i, '.webp');
            }
          }
          if (!s.image && s.id <= 18) {
            s.image = `/assets/images/sticker_${s.id}.webp`;
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
      if (s.id <= 18) {
        return { ...s, image: `/assets/images/sticker_${s.id}.webp` };
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
    description: 'Único pacote com chance da Suprema Bola de Ouro. A chance é raríssima: 1% por pacote.',
    guaranteed: '1 chance Suprema de 1% + 2 Mistas Premium'
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
    // Pacote intermediário: não libera a Suprema, para manter a raridade extrema.
    // 80% regular, 18% holográfica, 2% lendária, 0% suprema
    for (let i = 0; i < 3; i++) {
      results.push(gachaRoll({ regular: 80, holografica: 18, lendaria: 2, suprema: 0 }));
    }
  } else if (packageId === 'reliquia') {
    // Slot 1: 100% lendária. A Suprema não sai neste pacote.
    results.push(gachaRoll({ regular: 0, holografica: 0, lendaria: 100, suprema: 0 }));
    // Slot 2 e 3: mistas sem Suprema
    for (let i = 0; i < 2; i++) {
      results.push(gachaRoll({ regular: 84, holografica: 15, lendaria: 1, suprema: 0 }));
    }
  } else if (packageId === 'final') {
    // Único pacote com Suprema. Chance total de 1% por pacote: apenas o primeiro slot pode sortear Suprema.
    results.push(gachaRoll({ regular: 50, holografica: 35, lendaria: 14, suprema: 1 }));
    // Outros dois slots premium sem Suprema, para não multiplicar a chance real por pacote.
    for (let i = 0; i < 2; i++) {
      results.push(gachaRoll({ regular: 60, holografica: 32, lendaria: 8, suprema: 0 }));
    }
  }
  
  return results;
};

