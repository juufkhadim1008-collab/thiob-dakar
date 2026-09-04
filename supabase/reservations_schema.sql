-- =================================================================
-- THIOB-DAKAR — TABLE RESERVATIONS (à exécuter une seule fois dans
-- Supabase → SQL Editor). Sans cette table, les réservations restent
-- locales à l'appareil qui les crée et ne remontent jamais côté
-- restaurant ni dans Supabase.
-- =================================================================

CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  reservation_number TEXT UNIQUE NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests_count INT NOT NULL DEFAULT 2,
  occasion TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'confirmed' NOT NULL,
  deposit_amount INT DEFAULT 0,
  payment_method TEXT DEFAULT 'wave',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on reservations" ON public.reservations;
CREATE POLICY "Allow all operations for anon and authenticated on reservations" ON public.reservations FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'reservations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  END IF;
END $$;
