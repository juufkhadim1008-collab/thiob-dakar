import { AppNotification, NotificationType } from './types';

export const TERANGA_DAILY_MESSAGES = [
  {
    title: '🇸🇳 Teranga du Matin (10h) • Thiob Dakar',
    message: 'Salam wa Dakar ! 10h sonné, la journée bat son plein. Que le travail vous soit doux et prospère. Prenez un verre d’eau fraîche et pensez à votre déjeuner de midi. Teranga rek ! ❤️',
    icon: '☀️',
  },
  {
    title: '🍲 Pause Gourmande de 10h • Équipe Thiob',
    message: 'Nangadef Dakar ! C’est l’heure où les marmites commencent à frémir : Thiéboudienne Penda Mbaye, Yassa bien pimenté ou Dibi fumant ? Qu’importe votre choix, mangez avec le cœur et partagez la joie !',
    icon: '🥘',
  },
  {
    title: '✨ Douceur & Énergie • Teranga Thiob',
    message: 'Une pensée chaleureuse de toute l’équipe Thiob à tous les battants de Dakar : du Plateau à Keur Massar, de Ngor à Rufisque. Force à vous aujourd’hui, vous êtes notre fierté ! 🇸🇳',
    icon: '🌟',
  },
  {
    title: '🍹 Pause Rafraîchissante de 10h',
    message: 'Le soleil de Dakar commence à briller ! N’oubliez pas de vous hydrater avec un bon verre de Bissap frais ou de Bouye onctueux. Prenez soin de vous !',
    icon: '🍹',
  },
  {
    title: '🤝 Teranga & Bienveillance du Jour',
    message: 'La vraie Teranga commence par un sourire offert à son voisin. L’équipe Thiob vous souhaite une journée remplie de paix, de santé et de bénédictions (Jamm ak Khewel) !',
    icon: '🕊️',
  },
  {
    title: '☕ Ataya & Motivation • Thiob Dakar',
    message: '10h : l’heure idéale pour une pause constructive. Respirez un grand coup, la réussite vous attend au bout de l’effort. On est ensemble ! 🛵✨',
    icon: '☕',
  }
];

export const UPCOMING_FEATURES_ANNOUNCEMENTS = [
  {
    title: '🚀 Bientôt disponible : Commandes Groupées Bureau',
    message: 'Commandez ensemble entre collègues ou en famille sans payer plusieurs frais de livraison ! Déploiement prévu dans la prochaine mise à jour.',
    icon: '👥',
    type: 'system_update' as NotificationType,
  },
  {
    title: '🌙 Bientôt : Mode Nuit "Dibi Nocturne Dakar"',
    message: 'Une interface sombre immersive pour commander vos grillades et dibis tard la nuit avec suivi ultra-fluide des livreurs en direct.',
    icon: '🌙',
    type: 'system_update' as NotificationType,
  },
  {
    title: '💳 Nouveauté : Paiement Wave en 1 Clic Direct',
    message: 'Votre validation Wave est désormais instantanée grâce à notre nouvelle passerelle sécurisée temps réel.',
    icon: '⚡',
    type: 'system_update' as NotificationType,
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-teranga-today',
    type: 'teranga_daily',
    title: '🇸🇳 Teranga du Matin (10h) • Thiob Dakar',
    message: 'Salam wa Dakar ! 10h sonné, que votre journée soit douce et fructueuse. N’oubliez pas de vous hydrater et de commander votre Thiéb bien chaud pour midi. Teranga rek ! ❤️',
    icon: '☀️',
    timestamp: 'Aujourd’hui à 10:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3h ago
    read: false,
    priority: 'normal',
    actionRole: 'client',
  },
  {
    id: 'notif-geo-almadies',
    type: 'geo_proximity',
    title: '📍 Vous êtes dans la zone Almadies / Ngor',
    message: '3 restaurants réputés sont à moins de 5 min : Kamiss Gourmet, Thiéb Royal et Le Virage. Découvrez leurs spécialités locales !',
    icon: '📍',
    timestamp: 'Il y a 35 min',
    createdAt: Date.now() - 1000 * 60 * 35,
    read: false,
    priority: 'high',
    actionRole: 'client',
    actionData: {
      neighborhood: 'Almadies',
    },
  },
  {
    id: 'notif-new-resto-1',
    type: 'new_restaurant',
    title: '🎉 Nouveau Restaurant Partenaire inscrit !',
    message: 'Le restaurant "La Teranga Gourmande" aux Almadies vient d’ouvrir ses portes sur Thiob Express avec 15 plats exclusifs.',
    icon: '🍽️',
    timestamp: 'Il y a 2h',
    createdAt: Date.now() - 1000 * 60 * 120,
    read: false,
    priority: 'normal',
    actionRole: 'client',
  },
  {
    id: 'notif-update-1',
    type: 'system_update',
    title: '🚀 Mise à jour v2.4 déployée avec succès',
    message: 'Nouveau filtre par blocs de plats (Plat Local, Restaurant, Fast Food, Glacier, Jus & Dégué) et localisation GPS ultra-précise.',
    icon: '✨',
    timestamp: 'Hier',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
    priority: 'normal',
    actionRole: 'client',
  },
];
