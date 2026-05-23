'use client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Início',        href: '/admin',                icon: '⌂' },
  { label: 'Apartamentos',  href: '/admin/apartments',     icon: '🏢' },
  { label: 'Moradores',     href: '/admin/residents',      icon: '👥' },
  { label: 'Encomendas',    href: '/admin/packages',       icon: '📦', badge: 2 },
  { label: 'Reservas',      href: '/admin/reservations',   icon: '📅' },
  { label: 'Fila Facial',   href: '/admin/facial',         icon: '🪪' },
  { label: 'Comunicados',   href: '/admin/announcements',  icon: '📢', badge: 3 },
  { label: 'Relatórios',    href: '/admin/reports',        icon: '📄' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    router.push('/login');
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Mansão H. Villa Lobos"
        subtitle="Síndico"
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
