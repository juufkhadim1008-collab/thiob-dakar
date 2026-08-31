-- =================================================================
-- THIOB-DAKAR DATABASE SCHEMA (Supabase / PostgreSQL)
-- =================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('client', 'restaurant_owner', 'courier', 'super_admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready_for_pickup', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('wave', 'orange_money', 'card', 'cash');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'failed');

-- 3. PROFILES TABLE (Interconnected with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'client'::user_role NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  cover_image TEXT,
  logo TEXT,
  rating NUMERIC(2,1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  neighborhood TEXT NOT NULL, -- Ex: Almadies, Plateau, Point E, etc.
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  delivery_time_estimate TEXT DEFAULT '25-35 min',
  delivery_fee INT DEFAULT 1500, -- in FCFA
  min_order INT DEFAULT 2500, -- in FCFA
  is_open BOOLEAN DEFAULT TRUE,
  featured_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT
);

-- 6. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL, -- in FCFA
  image TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  preparation_time_minutes INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. COURIERS TABLE
CREATE TABLE IF NOT EXISTS public.couriers (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  vehicle_type TEXT DEFAULT 'moto',
  plate_number TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  current_neighborhood TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating NUMERIC(2,1) DEFAULT 5.0,
  completed_deliveries INT DEFAULT 0,
  today_earnings INT DEFAULT 0
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  courier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  subtotal INT NOT NULL,
  delivery_fee INT NOT NULL,
  platform_fee INT NOT NULL,
  total INT NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'paid'::payment_status,
  delivery_neighborhood TEXT NOT NULL,
  delivery_street TEXT NOT NULL,
  delivery_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price INT NOT NULL,
  quantity INT NOT NULL,
  notes TEXT
);

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

-- 11. POLICIES (Exemples)
CREATE POLICY "Public restaurants viewable by everyone" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public menu items viewable by everyone" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Orders viewable by owners, assigned restaurants, and couriers" ON public.orders FOR SELECT
  USING (
    auth.uid() = client_id OR 
    auth.uid() = courier_id OR 
    EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid())
  );
