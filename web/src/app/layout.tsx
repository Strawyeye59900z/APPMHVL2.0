import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mansão Heitor Villa Lobos',
  description: 'Sistema de gestão condominial',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-bg text-ink font-sans">{children}</body>
    </html>
  );
}
