'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem { label: string; href: string; icon: React.ReactNode; badge?: number }

interface SidebarProps {
  title: string;
  subtitle?: string;
  initials?: string;
  userName?: string;
  userSub?: string;
  items: NavItem[];
  onLogout: () => void;
}

export default function Sidebar({
  title, subtitle, initials = 'MH', userName, userSub, items, onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 shrink-0 h-screen sticky top-0 flex flex-col font-sans"
      style={{ background: '#070d18', borderRight: '1px solid #22324a' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: '1px solid #22324a' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-hero text-xl"
          style={{ background: '#1c3551', color: '#5b9be8' }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-ink leading-tight truncate">{title}</div>
          {subtitle && <div className="text-xs text-muted mt-0.5 truncate">{subtitle}</div>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted px-2.5 py-2">Menu</div>
        {items.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-soft text-primary font-bold'
                  : 'text-ink-2 hover:bg-bg-soft'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center"
                  style={{
                    background: active ? '#5b9be8' : '#1c3551',
                    color: active ? '#08121f' : '#a0b2c5',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3" style={{ borderTop: '1px solid #22324a' }}>
        {userName && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: '#131f33' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: '#d4ad6b', color: '#0c1422' }}
            >
              {userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink truncate leading-tight">{userName}</div>
              {userSub && <div className="text-xs text-muted truncate">{userSub}</div>}
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full text-left text-sm text-muted hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-900/20 transition-colors flex items-center gap-2"
        >
          <span>→</span> Sair
        </button>
      </div>
    </aside>
  );
}
