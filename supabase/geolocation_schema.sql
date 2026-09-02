-- =================================================================
-- THIOB EXPRESS - GÉOLOCALISATION & POSTGIS MIGRATION SCRIPT
-- =================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE courier_status_enum AS ENUM ('OFFLINE', 'ONLINE', 'AVAILABLE', 'BUSY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. AJOUT / ADAPTATION DES COLONNES GÉOGRAPHIQUES POSTGIS

-- A. Table RESTAURANTS
ALTER TABLE IF EXISTS public.restaurants
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326),
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- B. Table COURIERS (LIVREURS)
ALTER TABLE IF EXISTS public.couriers
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326),
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status courier_status_enum DEFAULT 'OFFLINE',
  ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ DEFAULT NOW();

-- C. Table PROFILES (CLIENTS / UTILISATEURS)
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326),
  ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ;

-- D. Table ORDERS (COMMANDES)
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS pickup_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS pickup_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS courier_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS courier_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS courier_location geography(Point, 4326);

-- 4. AUTOMATIC POSTGIS POINT SYNCHRONIZATION TRIGGER
CREATE OR REPLACE FUNCTION public.sync_geography_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trg_sync_restaurants_location ON public.restaurants;
CREATE TRIGGER trg_sync_restaurants_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();

DROP TRIGGER IF EXISTS trg_sync_couriers_location ON public.couriers;
CREATE TRIGGER trg_sync_couriers_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.couriers
  FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();

DROP TRIGGER IF EXISTS trg_sync_profiles_location ON public.profiles;
CREATE TRIGGER trg_sync_profiles_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_geography_point();

-- 5. SPATIAL GIST INDEXES (Pour des performances ultra-rapides)
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_couriers_location ON public.couriers USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST (location);

-- 6. RPC FUNCTION: GET NEARBY RESTAURANTS (ST_DWithin & ST_Distance)
CREATE OR REPLACE FUNCTION public.get_nearby_restaurants(
  client_lat DOUBLE PRECISION,
  client_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 5000,
  category_filter TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  tagline TEXT,
  description TEXT,
  cover_image TEXT,
  logo TEXT,
  rating NUMERIC,
  review_count INT,
  neighborhood TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  delivery_time_estimate TEXT,
  delivery_fee INT,
  min_order INT,
  is_open BOOLEAN,
  featured_tags TEXT[],
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_point geography;
BEGIN
  client_point := ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography;

  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.tagline,
    r.description,
    r.cover_image,
    r.logo,
    r.rating,
    r.review_count,
    r.neighborhood,
    r.address,
    r.latitude,
    r.longitude,
    r.delivery_time_estimate,
    r.delivery_fee,
    r.min_order,
    r.is_open,
    r.featured_tags,
    ROUND(ST_Distance(r.location, client_point)::numeric, 1)::double precision AS distance_meters
  FROM public.restaurants r
  WHERE r.location IS NOT NULL
    AND ST_DWithin(r.location, client_point, radius_meters)
  ORDER BY ST_Distance(r.location, client_point) ASC
  LIMIT limit_count;
END;
$$;

-- 7. RPC FUNCTION: GET NEARBY AVAILABLE COURIERS
CREATE OR REPLACE FUNCTION public.get_nearby_couriers(
  point_lat DOUBLE PRECISION,
  point_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 5000,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  plate_number TEXT,
  vehicle_type TEXT,
  is_online BOOLEAN,
  is_available BOOLEAN,
  status courier_status_enum,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_location_update TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point geography;
BEGIN
  search_point := ST_SetSRID(ST_MakePoint(point_lng, point_lat), 4326)::geography;

  RETURN QUERY
  SELECT 
    c.id,
    c.plate_number,
    c.vehicle_type,
    c.is_online,
    c.is_available,
    c.status,
    c.latitude,
    c.longitude,
    c.last_location_update,
    ROUND(ST_Distance(c.location, search_point)::numeric, 1)::double precision AS distance_meters
  FROM public.couriers c
  WHERE c.location IS NOT NULL
    AND c.is_online = TRUE
    AND (c.is_available = TRUE OR c.status = 'AVAILABLE')
    AND ST_DWithin(c.location, search_point, radius_meters)
  ORDER BY ST_Distance(c.location, search_point) ASC
  LIMIT limit_count;
END;
$$;

-- 8. RPC FUNCTION: UPDATE COURIER GPS & STATUS
CREATE OR REPLACE FUNCTION public.update_courier_gps(
  p_courier_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_status courier_status_enum DEFAULT NULL,
  p_is_online BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated TIMESTAMPTZ := NOW();
BEGIN
  UPDATE public.couriers
  SET 
    latitude = p_lat,
    longitude = p_lng,
    status = COALESCE(p_status, status),
    is_online = COALESCE(p_is_online, is_online),
    is_available = CASE 
      WHEN p_status = 'BUSY' THEN FALSE
      WHEN p_status = 'AVAILABLE' THEN TRUE
      WHEN p_is_online = FALSE THEN FALSE
      ELSE is_available
    END,
    last_location_update = v_updated
  WHERE id = p_courier_id;

  RETURN jsonb_build_object(
    'success', true,
    'courier_id', p_courier_id,
    'latitude', p_lat,
    'longitude', p_lng,
    'updated_at', v_updated
  );
END;
$$;

-- 9. RPC FUNCTION: UPDATE RESTAURANT LOCATION
CREATE OR REPLACE FUNCTION public.update_restaurant_location(
  p_restaurant_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_address TEXT DEFAULT NULL,
  p_neighborhood TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.restaurants
  SET 
    latitude = p_lat,
    longitude = p_lng,
    address = COALESCE(p_address, address),
    neighborhood = COALESCE(p_neighborhood, neighborhood)
  WHERE id = p_restaurant_id;

  RETURN jsonb_build_object(
    'success', true,
    'restaurant_id', p_restaurant_id,
    'latitude', p_lat,
    'longitude', p_lng
  );
END;
$$;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Restaurant policies
CREATE POLICY "Public restaurants location viewable" 
  ON public.restaurants FOR SELECT USING (true);

CREATE POLICY "Restaurant owner can update location" 
  ON public.restaurants FOR UPDATE 
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Courier policies
CREATE POLICY "Public can view online couriers coordinates for active orders" 
  ON public.couriers FOR SELECT 
  USING (is_online = true OR auth.uid() = id);

CREATE POLICY "Courier can update own position" 
  ON public.couriers FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can view and update own profile location" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 11. SUPABASE REALTIME ENABLEMENT
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.couriers;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;
