import { getWhoAmI } from '../lib/whoamiServer';

export default async function RequireRole({ allow, children }: { allow: Array<'stakeholder'|'director'|'pm'|'producer'|'hr'>; children: React.ReactNode }) {
  const me = await getWhoAmI();
  if (!me.authenticated) return (
    <div className="max-w-xl mx-auto p-6">
      <div className="card">Please sign in to access this page.</div>
    </div>
  );
  if (!allow.includes(me.role as any)) return (
    <div className="max-w-xl mx-auto p-6">
      <div className="card">401 — You do not have access to this page.</div>
    </div>
  );
  return <>{children}</>;
}


