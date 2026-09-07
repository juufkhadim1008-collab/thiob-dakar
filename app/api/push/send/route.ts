import { NextRequest, NextResponse } from 'next/server';
import { sendPushToTarget } from '@/lib/push-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, title, body: message, icon, url, tag } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title et body requis' }, { status: 400 });
    }

    const result = await sendPushToTarget(target || { all: true }, { title, body: message, icon, url, tag });
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[push/send] Exception :', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
