-- =================================================================
-- THIOB-DAKAR — NOTIFICATIONS PUSH (à exécuter une seule fois dans
-- Supabase → SQL Editor).
--
-- Stocke les abonnements Web Push des navigateurs (client, restaurant,
-- livreur) pour pouvoir leur envoyer une vraie notification même
-- app/onglet fermé (via un serveur, jamais depuis le navigateur).
-- =================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client', -- 'client' | 'restaurant' | 'courier'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  restaurant_id TEXT,
  courier_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_role ON public.push_subscriptions(role);
CREATE INDEX IF NOT EXISTS idx_push_subs_restaurant_id ON public.push_subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_courier_id ON public.push_subscriptions(courier_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- N'importe quel appareil peut s'abonner (créer/mettre à jour sa propre ligne).
-- La LECTURE en masse (pour envoyer les push) ne passe jamais par le navigateur :
-- elle se fait uniquement depuis le serveur avec la clé service_role, qui
-- contourne RLS — donc aucune policy SELECT publique n'est nécessaire ici.
DROP POLICY IF EXISTS "push_subscriptions_insert_any" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_insert_any" ON public.push_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "push_subscriptions_update_any" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_update_any" ON public.push_subscriptions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "push_subscriptions_delete_any" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_delete_any" ON public.push_subscriptions FOR DELETE USING (true);
