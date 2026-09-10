import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load env variables natively
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envConfig = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envConfig[match[1]] = value.trim();
  }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const vapidPublic = envConfig.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = envConfig.VAPID_PRIVATE_KEY;

if (!supabaseUrl || !supabaseKey || !vapidPublic || !vapidPrivate) {
  console.error('Missing configuration in .env.local');
  process.exit(1);
}

webpush.setVapidDetails('mailto:contact@thiob.sn', vapidPublic, vapidPrivate);
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const title = "📍 Dakar Déjeuner : C'est l'heure du Thiéboudienne ! 🍲";
  const body = "🇸🇳 Les marmites de Dakar sont prêtes ! Thiéboudienne Penda Mbaye au poisson frais, Yassa Poulet braisé aux oignons caramélisés et Mafé onctueux préparés tout près de vous. Livraison express chez vous en 20 min !";
  
  const payload = JSON.stringify({
    title,
    body,
    icon: '/images/Icone app.png',
    badge: '/images/Icone app.png',
    url: '/?entry=lunch_broadcast',
    tag: `thiob-lunch-${Date.now()}`
  });

  console.log('📡 Diffusion du message de midi aux utilisateurs...');

  const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
  if (error) {
    console.error('Error fetching subscriptions:', error);
    process.exit(1);
  }

  console.log(`Subscribers trouvés : ${subs ? subs.length : 0}`);

  let sent = 0;
  let failed = 0;

  for (const sub of (subs || [])) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
      console.log(`✅ Push midi envoyé à : ${sub.endpoint.slice(0, 45)}... [role: ${sub.role}]`);
    } catch (err) {
      failed++;
      console.warn(`⚠️ Échec envoi à ${sub.endpoint.slice(0, 45)}... :`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      }
    }
  }

  console.log(`\n🎉 Bilan d'envoi du message de midi :\n- Envoyés avec succès : ${sent}\n- Échecs/Expirés : ${failed}`);
}

main();
