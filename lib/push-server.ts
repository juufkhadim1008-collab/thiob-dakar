import webpush from 'web-push';
import { supabaseAdmin } from './supabase-admin';

// ⚠️ Server-only. Ne jamais importer depuis un composant 'use client'.

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:contact@thiob.sn', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushTarget {
  role?: 'client' | 'restaurant' | 'courier';
  restaurantId?: string;
  courierId?: string;
  all?: boolean;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

export async function sendPushToTarget(target: PushTarget, payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('[push-server] Clés VAPID manquantes — envoi annulé.');
    return { sent: 0, failed: 0 };
  }

  let query = supabaseAdmin.from('push_subscriptions').select('*');
  if (target.restaurantId) {
    query = query.eq('restaurant_id', target.restaurantId);
  } else if (target.courierId) {
    query = query.eq('courier_id', target.courierId);
  } else if (target.role && !target.all) {
    query = query.eq('role', target.role);
  }

  const { data: subs, error } = await query;
  if (error) {
    console.error('[push-server] Échec lecture abonnements :', error);
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  await Promise.all(
    (subs || []).map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: any) {
        failed++;
        // Abonnement expiré ou révoqué (410/404) : on le supprime pour garder la table propre
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        } else {
          console.error('[push-server] Échec envoi à', sub.endpoint, err?.message || err);
        }
      }
    })
  );

  return { sent, failed };
}
