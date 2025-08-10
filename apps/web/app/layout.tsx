import './globals.css';
import './design-tokens.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "CRTV Studio",
  description: "Streamline idea development through organization and creativity.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
