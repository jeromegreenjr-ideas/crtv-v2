export const metadata = {
  title: "CRTV Studio",
  description: "Streamline idea development through organization and creativity."
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
