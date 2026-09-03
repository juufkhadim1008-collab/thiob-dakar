-- =================================================================
-- THIOB-DAKAR PRODUCTION DATABASE SCHEMA (Supabase / PostgreSQL)
-- 100% Realtime Cross-Device Synchronization
-- =================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT DEFAULT 'L’Excellence et la Saveur de Dakar',
  description TEXT DEFAULT '',
  cover_image TEXT,
  logo TEXT,
  rating NUMERIC(2,1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  neighborhood TEXT NOT NULL DEFAULT 'Dakar',
  address TEXT NOT NULL DEFAULT 'Dakar, Sénégal',
  latitude DOUBLE PRECISION DEFAULT 14.7431,
  longitude DOUBLE PRECISION DEFAULT -17.5186,
  delivery_time_estimate TEXT DEFAULT '20-30 min',
  delivery_fee INT DEFAULT 1500,
  min_order INT DEFAULT 3000,
  is_open BOOLEAN DEFAULT TRUE,
  phone TEXT DEFAULT '+221 77 000 00 00',
  owner_name TEXT DEFAULT 'Chef Propriétaire',
  price_range TEXT DEFAULT '2 500 - 6 500 FCFA',
  featured_tags TEXT[] DEFAULT ARRAY['Nouveau Resto Dakar', 'Qualité Chef', 'Livraison Express'],
  opening_hours TEXT DEFAULT '11h30 - 23h30 (7j/7)',
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  ambiance_tags TEXT[] DEFAULT ARRAY['Terrasse', 'Fait Maison']::TEXT[],
  amenities TEXT[] DEFAULT ARRAY['Wifi', 'Paiement Wave']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT
);

-- Seed Default Categories
INSERT INTO public.categories (id, name, slug, icon, description)
VALUES 
  ('cat-thieb', 'Thiéboudienne', 'thieb', '🍲', 'Le plat national par excellence'),
  ('cat-yassa', 'Yassa & Mafé', 'yassa-mafe', '🍗', 'Poulet braisé oignons citronnés et mafé crémeux'),
  ('cat-dibi', 'Dibi & Grillades', 'dibi-grillades', '🥩', 'Agneau braisé et brochettes'),
  ('cat-street', 'Street Food & Pastels', 'street-food', '🥟', 'Pastels croustillants, fataya et burgers'),
  ('cat-boissons', 'Jus Locaux & Desserts', 'boissons-desserts', '🍹', 'Bissap frais, Bouye et Thiakry')
ON CONFLICT (id) DO NOTHING;

-- 4. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT DEFAULT 'cat-thieb',
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INT NOT NULL,
  image TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  preparation_time_minutes INT DEFAULT 20,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. COURIERS TABLE
CREATE TABLE IF NOT EXISTS public.couriers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo TEXT,
  vehicle_type TEXT DEFAULT 'moto',
  vehicle_name TEXT DEFAULT 'Moto Jakarta Express',
  plate_number TEXT DEFAULT 'DK-7842-AB',
  is_online BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'AVAILABLE',
  current_neighborhood TEXT DEFAULT 'Dakar',
  latitude DOUBLE PRECISION DEFAULT 14.6937,
  longitude DOUBLE PRECISION DEFAULT -17.4441,
  rating NUMERIC(2,1) DEFAULT 5.0,
  completed_deliveries INT DEFAULT 0,
  today_earnings INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  client_id TEXT DEFAULT 'client-anon',
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  courier_id TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  items JSONB DEFAULT '[]'::jsonb NOT NULL,
  subtotal INT NOT NULL,
  delivery_fee INT DEFAULT 1500 NOT NULL,
  platform_fee INT DEFAULT 500 NOT NULL,
  total INT NOT NULL,
  payment_method TEXT DEFAULT 'wave' NOT NULL,
  payment_status TEXT DEFAULT 'paid' NOT NULL,
  delivery_neighborhood TEXT NOT NULL,
  delivery_street TEXT NOT NULL,
  delivery_details TEXT DEFAULT '',
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. OPEN PRODUCTION ACCESS POLICIES (Anon + Authenticated)
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on restaurants" ON public.restaurants;
CREATE POLICY "Allow all operations for anon and authenticated on restaurants" ON public.restaurants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on categories" ON public.categories;
CREATE POLICY "Allow all operations for anon and authenticated on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on menu_items" ON public.menu_items;
CREATE POLICY "Allow all operations for anon and authenticated on menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on couriers" ON public.couriers;
CREATE POLICY "Allow all operations for anon and authenticated on couriers" ON public.couriers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on orders" ON public.orders;
CREATE POLICY "Allow all operations for anon and authenticated on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 9. ENABLE REALTIME BROADCASTING FOR ALL CLIENT PHONES
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'restaurants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'couriers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couriers;
  END IF;
END $$;
