import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALXO — Catch the work hiding between the lines',
  description:
    'Catch the work hiding between the lines. ALXO turns messy client conversations into an evidence-backed record of additional work, estimated impact, and actionable change orders.',
};

const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem('scope_creep_theme');
  var dark = t === 'dark' || (t !== 'light');
  document.documentElement.classList.toggle('dark', dark);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased selection:bg-primary/25 selection:text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}