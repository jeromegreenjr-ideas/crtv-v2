import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { ideas } from '@crtv/db';

export async function GET() {
  try {
    if (!db) return NextResponse.json({ ok: false, error: 'DB not configured' }, { status: 200 });
    await db.select().from(ideas).limit(1);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 200 });
  }
}


