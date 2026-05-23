'use client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Início',         href: '/resident',                icon: '⌂' },
  { label: 'Encomendas',     href: '/resident/packages',       icon: '📦' },
  { label: 'Reservas',       href: '/resident/reservations',   icon: '📅' },
  { label: 'Moradores do AP', href: '/resident/residents',     icon: '👥' },
  { label: 'Comunicados',    href: '/resident/announcements',  icon: '📢' },
];

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    router.push('/login');
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Mansão H. Villa Lobos"
        subtitle="Morador"
        initials="MH"
        items={NAV_ITEMS}
        onLogout={logout}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
