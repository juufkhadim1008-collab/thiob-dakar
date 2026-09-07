import { NextRequest, NextResponse } from 'next/server';
import { sendPushToTarget } from '@/lib/push-server';
import { TERANGA_DAILY_MESSAGES } from '@/lib/notifications-data';

// Déclenché une fois par jour à 10h (Africa/Dakar) par Vercel Cron — voir vercel.json.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const tmpl = TERANGA_DAILY_MESSAGES[Math.floor(Math.random() * TERANGA_DAILY_MESSAGES.length)];

  const result = await sendPushToTarget(
    { role: 'client' },
    {
      title: tmpl.title,
      body: tmpl.message,
      icon: '/images/Icone app.png',
      url: '/?entry=push',
      tag: 'teranga-daily',
    }
  );

  return NextResponse.json({ success: true, message: tmpl.title, ...result });
}
