import './globals.css';
import type { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: "CRTV Studio",
  description: "Streamline idea development through organization and creativity.",
  viewport: "width=device-width, initial-scale=1",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize Supabase on the server for session-aware rendering
  const supabase = createServerComponentClient({ cookies });
  // Optional: prefetch user to drive role-aware UI later
  await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gray-50 antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
