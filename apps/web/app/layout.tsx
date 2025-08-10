import './globals.css';
import { ToastProvider } from '../components/ToastProvider';
import RoleNav from '../components/RoleNav';
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
            {/* Role-aware sidebar */}
            {/* @ts-expect-error Server Component */}
            <RoleNav variant="sidebar" />
          </aside>
          <main>
            <ToastProvider>
              {children}
            </ToastProvider>
          </main>
          {/* @ts-expect-error Server Component */}
          <RoleNav variant="tabs" />
        </div>
      </body>
    </html>
  );
}
