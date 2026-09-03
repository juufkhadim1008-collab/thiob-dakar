import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uyflqpwvchawiynooaia.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_KEY && typeof window !== 'undefined') {
  console.error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante. Toutes les lectures/écritures Supabase vont échouer.');
} else if (SUPABASE_KEY.startsWith('sb_secret_') && typeof window !== 'undefined') {
  console.error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY contient une clé SECRÈTE (sb_secret_...), pas la clé publique "anon"/"publishable". Cette clé est exposée dans le bundle du navigateur et doit être remplacée immédiatement par la clé publique depuis Supabase → Settings → API, puis régénérée côté Supabase.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
