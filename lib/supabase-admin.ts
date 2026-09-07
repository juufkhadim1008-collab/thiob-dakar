import { createClient } from '@supabase/supabase-js';

// ⚠️ Ce fichier ne doit JAMAIS être importé depuis un composant 'use client'.
// Il utilise la clé service_role (accès total, contourne RLS) et ne doit
// s'exécuter que côté serveur (routes app/api/**/route.ts).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uyflqpwvchawiynooaia.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY est manquante — les envois de notifications push échoueront.');
}

// createClient exige une chaîne non vide : on passe un placeholder si la clé
// manque, pour échouer proprement à l'appel (erreur gérée) plutôt qu'au démarrage.
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || 'missing-service-role-key', {
  auth: { persistSession: false, autoRefreshToken: false },
});
