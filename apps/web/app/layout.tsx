import './globals.css';
import type { Metadata, Viewport } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: "CRTV Studio",
  description: "Streamline idea development through organization and creativity.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize Supabase on the server for session-aware rendering (only if envs are present)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerComponentClient({ cookies });
    await supabase.auth.getUser();
  }

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gray-50 antialiased">
        <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block border-r bg-white">
            <nav className="p-4 space-y-2 text-sm">
              <a className="block hover:underline" href="/ideas">Ideas</a>
              <a className="block hover:underline" href="/projects">Projects</a>
              <a className="block hover:underline" href="/tasks">Tasks</a>
              <a className="block hover:underline" href="/notifications">Notifications</a>
              <a className="block hover:underline" href="/reports">Reports</a>
              <a className="block hover:underline" href="/communication">Communication</a>
            </nav>
          </aside>
          <main>{children}</main>
          <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t grid grid-cols-4 text-sm">
            <a className="p-3 text-center" href="/ideas">Ideas</a>
            <a className="p-3 text-center" href="/projects">Projects</a>
            <a className="p-3 text-center" href="/tasks">Tasks</a>
            <a className="p-3 text-center" href="/notifications">Alerts</a>
          </nav>
        </div>
      </body>
    </html>
  );
}
