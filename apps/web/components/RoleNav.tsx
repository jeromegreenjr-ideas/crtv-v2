import { getWhoAmI } from '../lib/whoamiServer';
import Link from 'next/link';

type Variant = 'sidebar' | 'tabs';

const roleToLinks: Record<string, Array<{ href: string; label: string }>> = {
  director: [
    { href: '/ideas', label: 'Ideas' },
    { href: '/projects', label: 'Projects' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/reports', label: 'Reports' },
  ],
  pm: [
    { href: '/ideas', label: 'Ideas' },
    { href: '/projects', label: 'Projects' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/communication', label: 'Comm' },
  ],
  producer: [
    { href: '/ideas', label: 'Ideas' },
    { href: '/projects', label: 'Projects' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/notifications', label: 'Alerts' },
  ],
  hr: [
    { href: '/ideas', label: 'Ideas' },
    { href: '/projects', label: 'Checkpoints' },
    { href: '/reports', label: 'Personnel' },
    { href: '/notifications', label: 'Evaluation' },
  ],
  stakeholder: [
    { href: '/ideas', label: 'Ideas' },
    { href: '/projects', label: 'Projects' },
    { href: '/reports', label: 'Reports' },
    { href: '/notifications', label: 'Alerts' },
  ],
};

export default async function RoleNav({ variant }: { variant: Variant }) {
  const me = await getWhoAmI();
  const role = (me.role || 'stakeholder').toLowerCase();
  const links = roleToLinks[role] || roleToLinks['stakeholder'];
  if (variant === 'sidebar') {
    return (
      <nav className="p-4 space-y-2 text-sm">
        {links.map((l) => (
          <Link key={l.href} className="block hover:underline" href={l.href}>{l.label}</Link>
        ))}
      </nav>
    );
  }
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t grid grid-cols-4 text-sm">
      {links.slice(0,4).map((l) => (
        <Link key={l.href} className="p-3 text-center" href={l.href}>{l.label}</Link>
      ))}
    </nav>
  );
}


