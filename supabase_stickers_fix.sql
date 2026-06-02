-- COPA DAS METAS / HUSF - Correção das imagens das figurinhas
-- Cole no Supabase > SQL Editor e clique em Run.

-- Garante que o catálogo padrão tenha caminhos leves (.webp) e inclui a figurinha 18.
INSERT INTO public.husf_stickers (id, name, rarity, image)
VALUES
  (1,  'Figurinha Meta 1 - #1',  'trabalho:regular',    '/assets/images/sticker_1.webp'),
  (2,  'Figurinha Meta 2 - #2',  'trabalho:regular',    '/assets/images/sticker_2.webp'),
  (3,  'Figurinha Meta 3 - #3',  'trabalho:regular',    '/assets/images/sticker_3.webp'),
  (4,  'Figurinha Meta 4 - #4',  'trabalho:regular',    '/assets/images/sticker_4.webp'),
  (5,  'Figurinha Meta 5 - #5',  'trabalho:regular',    '/assets/images/sticker_5.webp'),
  (6,  'Figurinha Meta 6 - #6',  'trabalho:regular',    '/assets/images/sticker_6.webp'),
  (7,  'Figurinha Meta 1 - #7',  'evolucao:regular',    '/assets/images/sticker_7.webp'),
  (8,  'Figurinha Meta 2 - #8',  'evolucao:regular',    '/assets/images/sticker_8.webp'),
  (9,  'Figurinha Meta 3 - #9',  'evolucao:regular',    '/assets/images/sticker_9.webp'),
  (10, 'Figurinha Meta 4 - #10', 'evolucao:regular',    '/assets/images/sticker_10.webp'),
  (11, 'Figurinha Meta 5 - #11', 'evolucao:regular',    '/assets/images/sticker_11.webp'),
  (12, 'Figurinha Meta 6 - #12', 'evolucao:regular',    '/assets/images/sticker_12.webp'),
  (13, 'Celso Paredão',          'hall:holografica',    '/assets/images/sticker_13.webp'),
  (14, 'Speak Up',               'hall:holografica',    '/assets/images/sticker_14.webp'),
  (15, 'Lampião',                'hall:lendaria',       '/assets/images/sticker_15.webp'),
  (16, 'Mãos Limpas',            'hall:lendaria',       '/assets/images/sticker_16.webp'),
  (17, 'Suprema Bola de Ouro',   'hall:suprema',        '/assets/images/sticker_17.webp'),
  (18, 'Celso Paredão Especial', 'hall:holografica',    '/assets/images/sticker_18.webp')
ON CONFLICT (id) DO UPDATE SET
  rarity = EXCLUDED.rarity,
  image = EXCLUDED.image;

-- Corrige caminhos antigos salvos como /src/assets.
UPDATE public.husf_stickers
SET image = replace(image, '/src/assets/', '/assets/')
WHERE image LIKE '/src/assets/%';
