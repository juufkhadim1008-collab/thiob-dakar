import { NextRequest, NextResponse } from 'next/server';
import { sendPushToTarget } from '@/lib/push-server';
import { TERANGA_DAILY_MESSAGES } from '@/lib/notifications-data';

export const DAKAR_LUNCH_MESSAGES = [
  {
    title: "📍 Dakar Déjeuner : C'est l'heure du Thiéboudienne ! 🍲",
    message: "🇸🇳 Les marmites de Dakar sont prêtes ! Thiéboudienne Penda Mbaye, Yassa Poulet braisé et Mafé onctueux préparés près de vous. Livraison rapide en 20 min !"
  },
  {
    title: "🍛 Midi à Dakar : Thieb Chaud & Poisson Frais !",
    message: "Le riz rouge parfumé aux légumes du marché et piment vert vous attend. Commandez auprès des meilleurs restaurateurs de votre quartier !"
  },
  {
    title: "🍗 Pause Déjeuner : Yassa Poulet & Oignons Caramélisés !",
    message: "Un bon Yassa fondant bien relevé au citron pour recharger vos batteries. Livraison express sur votre lieu de travail ou à domicile."
  }
];

export const DAKAR_DINNER_MESSAGES = [
  {
    title: "🥩 Soirée Dakar : Dibiterie Chaude & Dibi d'Agneau ! 🔥",
    message: "Le parfum du feu de bois et de la viande grillée avec piment et oignons croquants. Vos dibiteries de quartier sont prêtes !"
  },
  {
    title: "🍢 Dîner Gourmand : Brochettes fumantes & Pastels croustillants !",
    message: "Faites-vous plaisir ce soir avec les spécialités nocturnes de Dakar livrées chaudes à votre porte."
  }
];

// Déclenché automatiquement par Vercel Cron (10h, 12h30, 19h30 heure de Dakar)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestedType = searchParams.get('type');

  // Détection selon l'heure de Dakar (UTC) ou paramètre explicite
  const now = new Date();
  const utcHour = now.getUTCHours(); // Dakar est UTC+0
  
  let selectedTitle = '';
  let selectedBody = '';
  let tag = 'daily-broadcast';

  if (requestedType === 'lunch' || (!requestedType && utcHour >= 11 && utcHour < 15)) {
    const tmpl = DAKAR_LUNCH_MESSAGES[Math.floor(Math.random() * DAKAR_LUNCH_MESSAGES.length)];
    selectedTitle = tmpl.title;
    selectedBody = tmpl.message;
    tag = 'lunch-daily';
  } else if (requestedType === 'dinner' || (!requestedType && utcHour >= 18 && utcHour <= 23)) {
    const tmpl = DAKAR_DINNER_MESSAGES[Math.floor(Math.random() * DAKAR_DINNER_MESSAGES.length)];
    selectedTitle = tmpl.title;
    selectedBody = tmpl.message;
    tag = 'dinner-daily';
  } else {
    const tmpl = TERANGA_DAILY_MESSAGES[Math.floor(Math.random() * TERANGA_DAILY_MESSAGES.length)];
    selectedTitle = tmpl.title;
    selectedBody = tmpl.message;
    tag = 'teranga-daily';
  }

  const result = await sendPushToTarget(
    { role: 'client', all: true },
    {
      title: selectedTitle,
      body: selectedBody,
      icon: '/images/Icone app.png',
      badge: '/images/Icone app.png',
      url: '/?entry=daily_push',
      tag,
    }
  );

  return NextResponse.json({ success: true, title: selectedTitle, body: selectedBody, ...result });
}

