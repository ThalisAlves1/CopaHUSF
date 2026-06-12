-- COPA DAS METAS / HUSF - Correção das imagens das figurinhas
-- Cole no Supabase > SQL Editor e clique em Run.



-- Ping leve para o app testar a conexão sem puxar tabelas pesadas.
CREATE OR REPLACE FUNCTION public.husf_ping()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT 'ok'::text;
$$;

GRANT EXECUTE ON FUNCTION public.husf_ping() TO anon;
GRANT EXECUTE ON FUNCTION public.husf_ping() TO authenticated;

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

-- Permite upload real de imagens das figurinhas pelo painel Admin.
-- Cria um bucket público chamado husf-stickers no Supabase Storage.
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

-- OTIMIZAÇÕES PARA PLANO FREE / FLUIDEZ DO APP
-- Limita uploads do bucket a 1 MB e aceita só imagens comuns.
UPDATE storage.buckets
SET
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png']
WHERE id = 'husf-stickers';

-- Índices leves para acelerar ranking, admin e consultas por atualização.
CREATE INDEX IF NOT EXISTS husf_users_sector_idx ON public.husf_users (sector);
CREATE INDEX IF NOT EXISTS husf_users_updated_at_idx ON public.husf_users (updated_at DESC);
CREATE INDEX IF NOT EXISTS husf_stickers_id_idx ON public.husf_stickers (id);

-- Limpeza simples de sessões antigas de troca para não acumular lixo no banco.
DELETE FROM public.husf_trades
WHERE expires_at < (EXTRACT(EPOCH FROM (NOW() - INTERVAL '7 days')) * 1000)::bigint;

-- Se a tabela do mercado existir, cria índices e mantém a listagem mais rápida.
DO $$ BEGIN
  IF to_regclass('public.husf_sticker_market') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS husf_sticker_market_status_created_idx
      ON public.husf_sticker_market (status, created_at DESC);
    CREATE INDEX IF NOT EXISTS husf_sticker_market_seller_idx
      ON public.husf_sticker_market (seller_cpf);
  END IF;
END $$;

-- Regra de raridade extrema: a figurinha Suprema não pode ser vendida/comprada diretamente no mercado.
-- Ela deve sair somente no Pacote Grandes Finais, com chance de 1%, ou ser concedida manualmente pelo Admin.
CREATE OR REPLACE FUNCTION public.husf_prevent_suprema_market_listing()
RETURNS trigger AS $$
DECLARE
  v_rarity TEXT;
BEGIN
  SELECT rarity INTO v_rarity
  FROM public.husf_stickers
  WHERE id = NEW.sticker_id;

  IF COALESCE(v_rarity, '') LIKE '%suprema%' AND NEW.status = 'active' THEN
    RAISE EXCEPTION 'A figurinha Suprema não pode ser anunciada no mercado.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF to_regclass('public.husf_sticker_market') IS NOT NULL THEN
    UPDATE public.husf_sticker_market AS market
    SET status = 'cancelled'
    FROM public.husf_stickers AS sticker
    WHERE market.sticker_id = sticker.id
      AND sticker.rarity LIKE '%suprema%'
      AND market.status = 'active';

    DROP TRIGGER IF EXISTS husf_prevent_suprema_market_listing_trg ON public.husf_sticker_market;
    CREATE TRIGGER husf_prevent_suprema_market_listing_trg
      BEFORE INSERT OR UPDATE OF sticker_id, status ON public.husf_sticker_market
      FOR EACH ROW
      EXECUTE FUNCTION public.husf_prevent_suprema_market_listing();
  END IF;
END $$;

-- FILA VIRTUAL PARA PROTEGER O SUPABASE
-- Crie essa tabela para limitar quantos colaboradores entram no app ao mesmo tempo.
CREATE TABLE IF NOT EXISTS public.husf_queue_sessions (
  cpf TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS husf_queue_sessions_created_idx
  ON public.husf_queue_sessions (created_at ASC);

CREATE INDEX IF NOT EXISTS husf_queue_sessions_last_seen_idx
  ON public.husf_queue_sessions (last_seen DESC);

ALTER TABLE public.husf_queue_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public Queue Select" ON public.husf_queue_sessions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public Queue Insert" ON public.husf_queue_sessions FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public Queue Update" ON public.husf_queue_sessions FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public Queue Delete" ON public.husf_queue_sessions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Limpeza manual opcional de sessões antigas da fila.
DELETE FROM public.husf_queue_sessions
WHERE last_seen < NOW() - INTERVAL '10 minutes';
