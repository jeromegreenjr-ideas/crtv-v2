import { NextResponse } from 'next/server';
import { isStorageConfigured, createUploadUrl } from '../../../../lib/uploads';

export async function GET() {
  try {
    if (!isStorageConfigured()) return NextResponse.json({ ok: false, error: 'Storage not configured' }, { status: 200 });
    const probe = await createUploadUrl({ key: `health/${Date.now()}.txt`, contentType: 'text/plain', expiresSeconds: 60 });
    return NextResponse.json({ ok: true, signed: Boolean(probe.uploadUrl), publicUrl: probe.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 200 });
  }
}


