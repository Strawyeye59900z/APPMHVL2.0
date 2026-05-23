'use client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Registrar encomenda',  href: '/gate',         icon: '📦' },
  { label: 'Encomendas pendentes', href: '/gate/pending', icon: '📋' },
];

export default function GateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    router.push('/login');
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Mansão H. Villa Lobos"
        subtitle="Portaria"
        initials="MH"
        items={NAV_ITEMS}
        onLogout={logout}
      />
      <main className="flex-1 min-w-0 overflow-auto p-8 max-w-2xl">
        {children}
      </main>
    </div>
  );
}
