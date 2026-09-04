-- =================================================================
-- THIOB-DAKAR — AUTHENTIFICATION RÉELLE (à exécuter une seule fois
-- dans Supabase → SQL Editor, après avoir activé Email/Password et
-- Google/Facebook dans Supabase → Authentication → Providers).
--
-- Ajoute un lien réel entre un compte Supabase Auth (auth.uid()) et
-- "quel restaurant / quel livreur est le sien", pour que la
-- connexion fonctionne correctement depuis n'importe quel appareil.
-- =================================================================

-- 1. Colonne de propriétaire sur restaurants et couriers
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON public.restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_couriers_user_id ON public.couriers(user_id);

-- 2. Policies affinées : lecture publique (vitrine client), mais
--    création/modification/suppression réservées au propriétaire.
--    Les lignes existantes sans propriétaire (user_id NULL) restent
--    modifiables le temps qu'elles soient "réclamées" — ça évite de
--    bloquer les restaurants déjà créés avant cette migration.

-- --- RESTAURANTS ---
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on restaurants" ON public.restaurants;

DROP POLICY IF EXISTS "restaurants_select_public" ON public.restaurants;
CREATE POLICY "restaurants_select_public" ON public.restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "restaurants_insert_own" ON public.restaurants;
CREATE POLICY "restaurants_insert_own" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "restaurants_update_own" ON public.restaurants;
CREATE POLICY "restaurants_update_own" ON public.restaurants FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "restaurants_delete_own" ON public.restaurants;
CREATE POLICY "restaurants_delete_own" ON public.restaurants FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- --- COURIERS ---
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on couriers" ON public.couriers;

DROP POLICY IF EXISTS "couriers_select_public" ON public.couriers;
CREATE POLICY "couriers_select_public" ON public.couriers FOR SELECT USING (true);

DROP POLICY IF EXISTS "couriers_insert_own" ON public.couriers;
CREATE POLICY "couriers_insert_own" ON public.couriers FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "couriers_update_own" ON public.couriers;
CREATE POLICY "couriers_update_own" ON public.couriers FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "couriers_delete_own" ON public.couriers;
CREATE POLICY "couriers_delete_own" ON public.couriers FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
