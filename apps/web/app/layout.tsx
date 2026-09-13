import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scope Creep Ledger — AI Scope Drift Accounting',
  description:
    'Identify unbilled scope expansion in client conversations, quantify extra hours, and generate defensible receipts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
