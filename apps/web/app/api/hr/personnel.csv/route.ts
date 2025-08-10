import { NextResponse } from 'next/server';
import { GET as getPersonnel } from '../personnel/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  const res: any = await getPersonnel();
  const data = await res.json();
  const rows: any[] = data.personnel || [];
  const header = ['userId','email','tier','quality','timeliness','collaboration'];
  const csv = [header.join(',')].concat(rows.map(r => [r.userId, r.email, r.tier, r.quality, r.timeliness, r.collaboration].join(','))).join('\n');
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="personnel.csv"' } });
}


