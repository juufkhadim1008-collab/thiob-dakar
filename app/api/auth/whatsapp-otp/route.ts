import { NextRequest, NextResponse } from 'next/server';

// Stockage temporaire en mémoire des codes OTP (validité 5 minutes)
// En production à grande échelle, peut être stocké dans Redis ou Supabase auth.otps
interface OtpEntry {
  code: string;
  phone: string;
  fullName?: string;
  createdAt: number;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

// Nettoyage régulier des codes expirés
function cleanExpiredOtps() {
  const now = Date.now();
  for (const [phone, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanExpiredOtps();
    const body = await req.json();
    const { action, phone, code, fullName } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone requis.' },
        { status: 400 }
      );
    }

    // Normalisation du numéro (format international sénégalais par défaut)
    let cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('221')) {
        cleanPhone = '+' + cleanPhone;
      } else {
        cleanPhone = '+221' + cleanPhone;
      }
    }

    // =========================================================================
    // ACTION 1 : ENVOI DU CODE OTP VIA WHATSAPP
    // =========================================================================
    if (action === 'send') {
      // Génération d'un code sécurisé à 6 chiffres
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const now = Date.now();
      const expiresAt = now + 5 * 60 * 1000; // 5 minutes

      otpStore.set(cleanPhone, {
        code: generatedCode,
        phone: cleanPhone,
        fullName: fullName || 'Client Thiob',
        createdAt: now,
        expiresAt,
      });

      const messageText = `🇸🇳 *THIOB DAKAR*\n\nVotre code de connexion sécurisé est : *${generatedCode}*\n\nCe code est valable pendant 5 minutes. Ne le partagez avec personne.`;

      // Vérifier si les identifiants officiels Meta WhatsApp Cloud API sont configurés
      const metaToken = process.env.META_WHATSAPP_TOKEN;
      const metaPhoneId = process.env.META_WHATSAPP_PHONE_ID;

      let metaSent = false;
      if (metaToken && metaPhoneId) {
        try {
          const metaRes = await fetch(
            `https://graph.facebook.com/v19.0/${metaPhoneId}/messages`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${metaToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone.replace('+', ''),
                type: 'text',
                text: { body: messageText },
              }),
            }
          );
          if (metaRes.ok) {
            metaSent = true;
          }
        } catch (metaErr) {
          console.error('Erreur API Meta WhatsApp :', metaErr);
        }
      }

      // Lien direct Click-to-Chat WhatsApp wa.me de secours / interaction
      const encodedMsg = encodeURIComponent(
        `Bonjour Thiob Dakar, voici mon code de connexion pour mon compte : ${generatedCode}`
      );
      const directWhatsAppLink = `https://wa.me/221770000000?text=${encodedMsg}`;

      return NextResponse.json({
        success: true,
        message: metaSent
          ? 'Code de sécurité envoyé sur votre WhatsApp !'
          : 'Code de sécurité WhatsApp généré.',
        phone: cleanPhone,
        metaSent,
        // En mode démo / test local, on renvoie le code pour faciliter les tests
        debugCode: process.env.NODE_ENV !== 'production' ? generatedCode : undefined,
        directWhatsAppLink,
        expiresInSeconds: 300,
      });
    }

    // =========================================================================
    // ACTION 2 : VÉRIFICATION DU CODE OTP
    // =========================================================================
    if (action === 'verify') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Code de sécurité requis.' },
          { status: 400 }
        );
      }

      const storedOtp = otpStore.get(cleanPhone);

      if (!storedOtp) {
        return NextResponse.json(
          {
            success: false,
            error: 'Aucun code en attente ou code expiré. Veuillez en demander un nouveau.',
          },
          { status: 400 }
        );
      }

      if (Date.now() > storedOtp.expiresAt) {
        otpStore.delete(cleanPhone);
        return NextResponse.json(
          { success: false, error: 'Le code a expiré (validité 5 min). Demandez-en un nouveau.' },
          { status: 400 }
        );
      }

      const inputCleanCode = code.trim().replace(/\s/g, '');
      if (storedOtp.code !== inputCleanCode) {
        return NextResponse.json(
          { success: false, error: 'Code incorrect. Veuillez vérifier le code reçu sur WhatsApp.' },
          { status: 400 }
        );
      }

      // Code validé avec succès ! On supprime le code utilisé
      otpStore.delete(cleanPhone);

      return NextResponse.json({
        success: true,
        verified: true,
        phone: cleanPhone,
        fullName: storedOtp.fullName,
        message: 'Connexion WhatsApp réussie !',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non supportée.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erreur API WhatsApp Auth :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
