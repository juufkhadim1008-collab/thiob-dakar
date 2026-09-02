-- ==============================================================================
-- THIOB EXPRESS — EXTENSION POSTGIS & SYSTÈME DE GÉOLOCALISATION ULTRA-PRÉCISE
-- Script SQL certifié pour Supabase / PostgreSQL avec PostGIS
-- ==============================================================================

-- 1. Activation de l'extension PostGIS
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Mise à jour de la table RESTAURANTS avec métadonnées de précision
ALTER TABLE IF EXISTS public.restaurants
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- 3. Mise à jour de la table COURIERS avec suivi temps réel & précision
ALTER TABLE IF EXISTS public.couriers
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION DEFAULT 8.0,
  ADD COLUMN IF NOT EXISTS bearing DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS altitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'OFFLINE' CHECK (status IN ('OFFLINE', 'ONLINE', 'AVAILABLE', 'BUSY')),
  ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ DEFAULT NOW();

-- 4. Mise à jour de la table PROFILES (Clients)
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS default_address TEXT,
  ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ DEFAULT NOW();

-- 5. Mise à jour de la table ORDERS avec Destination de Livraison Exacte
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS pickup_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS pickup_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS pickup_location GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS delivery_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_location GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS delivery_accuracy DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS delivery_landmark TEXT,
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
  ADD COLUMN IF NOT EXISTS courier_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS courier_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS courier_location GEOGRAPHY(Point, 4326);

-- 6. Trigger automatique de synchronisation des points géographiques PostGIS
CREATE OR REPLACE FUNCTION public.sync_geography_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sync_order_geography_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pickup_latitude IS NOT NULL AND NEW.pickup_longitude IS NOT NULL THEN
    NEW.pickup_location := ST_SetSRID(ST_MakePoint(NEW.pickup_longitude, NEW.pickup_latitude), 4326)::geography;
  END IF;
  IF NEW.delivery_latitude IS NOT NULL AND NEW.delivery_longitude IS NOT NULL THEN
    NEW.delivery_location := ST_SetSRID(ST_MakePoint(NEW.delivery_longitude, NEW.delivery_latitude), 4326)::geography;
  END IF;
  IF NEW.courier_latitude IS NOT NULL AND NEW.courier_longitude IS NOT NULL THEN
    NEW.courier_location := ST_SetSRID(ST_MakePoint(NEW.courier_longitude, NEW.courier_latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

DROP TRIGGER IF EXISTS trg_sync_orders_locations ON public.orders;
CREATE TRIGGER trg_sync_orders_locations
  BEFORE INSERT OR UPDATE OF pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, courier_latitude, courier_longitude ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.sync_order_geography_points();

-- 7. Index Spatiaux GiST pour requêtes haute vitesse
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_couriers_location ON public.couriers USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_location ON public.orders USING GIST(delivery_location);

-- 8. Fonctions RPC Supabase pour calculs de proximité ultra-précis
CREATE OR REPLACE FUNCTION public.get_nearby_restaurants(
  client_lat DOUBLE PRECISION,
  client_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 10000.0,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  tagline TEXT,
  cover_image TEXT,
  rating NUMERIC,
  review_count INTEGER,
  neighborhood TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  client_geom GEOGRAPHY;
BEGIN
  client_geom := ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.tagline,
    r.cover_image,
    r.rating,
    r.review_count,
    r.neighborhood,
    r.address,
    r.latitude,
    r.longitude,
    ST_Distance(r.location, client_geom) AS distance_meters,
    ROUND((ST_Distance(r.location, client_geom) / 1000.0)::numeric, 2)::DOUBLE PRECISION AS distance_km
  FROM public.restaurants r
  WHERE r.location IS NOT NULL
    AND ST_DWithin(r.location, client_geom, radius_meters)
  ORDER BY r.location <-> client_geom
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_nearby_couriers(
  point_lat DOUBLE PRECISION,
  point_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 8000.0,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  plate_number TEXT,
  rating NUMERIC,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_accuracy DOUBLE PRECISION,
  status TEXT,
  distance_meters DOUBLE PRECISION
) AS $$
DECLARE
  ref_geom GEOGRAPHY;
BEGIN
  ref_geom := ST_SetSRID(ST_MakePoint(point_lng, point_lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.phone,
    c.plate_number,
    c.rating,
    c.latitude,
    c.longitude,
    c.location_accuracy,
    c.status,
    ST_Distance(c.location, ref_geom) AS distance_meters
  FROM public.couriers c
  WHERE c.location IS NOT NULL
    AND c.is_online = true
    AND c.status IN ('ONLINE', 'AVAILABLE')
    AND ST_DWithin(c.location, ref_geom, radius_meters)
  ORDER BY c.location <-> ref_geom
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_courier_gps(
  p_courier_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_accuracy DOUBLE PRECISION DEFAULT 5.0,
  p_bearing DOUBLE PRECISION DEFAULT 0.0,
  p_status TEXT DEFAULT 'AVAILABLE',
  p_is_online BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.couriers
  SET 
    latitude = p_lat,
    longitude = p_lng,
    location_accuracy = p_accuracy,
    bearing = p_bearing,
    status = p_status,
    is_online = p_is_online,
    is_available = (p_status = 'AVAILABLE'),
    last_location_update = NOW()
  WHERE id = p_courier_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Activation de Supabase Realtime pour diffusion en direct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'couriers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couriers;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
