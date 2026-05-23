'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Package { id: string; type: string; receivedAt: string }
interface Announcement { id: string; title: string; publishedAt: string }
interface Reservation { id: string; spaceType: string; startsAt: string }

export default function ResidentHomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    api.get('/packages?status=pending').then(r => setPackages(r.data)).catch(() => {});
    api.get('/announcements').then(r => setAnnouncements(r.data.slice(0, 2))).catch(() => {});
    api.get('/reservations?mine=true&status=active').then(r => {
      const sorted = [...r.data].sort((a: Reservation, b: Reservation) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
      setNextReservation(sorted[0] ?? null);
    }).catch(() => {});
  }, []);

  const typeLabel: Record<string, string> = { BOX: 'Caixa', ENVELOPE: 'Envelope', BAG: 'Sacola' };
  const spaceLabel: Record<string, string> = { COURT: 'Quadra', BBQ: 'Churrasqueira', HALL: 'Salão de festas' };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0c1422' }}>
      {/* Hero glow */}
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative p-8 max-w-3xl">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
            Mansão H. Villa Lobos
          </p>
          <h1 className="font-hero text-5xl font-normal leading-tight tracking-tight">
            Boa tarde,<br />
            <em className="italic" style={{ color: '#5b9be8' }}>morador.</em>
          </h1>
          <p className="text-sm text-muted mt-3">
            {packages.length > 0
              ? `${packages.length} encomenda${packages.length > 1 ? 's' : ''} aguardando retirada na portaria.`
              : 'Tudo certo na portaria. Nenhuma encomenda pendente.'}
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { href: '/resident/reservations', icon: '📅', label: 'Reservar', primary: true },
            { href: '/resident/packages',     icon: '📦', label: 'Encomendas', primary: false },
            { href: '/resident/residents',    icon: '👥', label: 'Família',    primary: false },
            { href: '/resident/announcements',icon: '📢', label: 'Avisos',     primary: false },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 border transition-colors hover:brightness-110 active:scale-95"
              style={{
                background: item.primary ? '#5b9be8' : '#111a2a',
                color: item.primary ? '#08121f' : '#e8eef5',
                borderColor: item.primary ? 'transparent' : '#22324a',
              }}
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Packages */}
        {packages.length > 0 && (
          <div className="mb-8">
            <div className="section-label">
              <span className="section-label-text">Encomendas</span>
              <Link href="/resident/packages" className="text-xs font-semibold" style={{ color: '#5b9be8' }}>
                Ver tudo
              </Link>
            </div>
            <div className="card p-0 divide-y divide-hairline overflow-hidden">
              {packages.slice(0, 3).map(pkg => (
                <div key={pkg.id} className="flex items-center gap-4 p-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: '#1c3551' }}
                  >
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="pill-primary mb-1 inline-block">Aguardando</span>
                    <div className="font-semibold text-sm text-ink">{typeLabel[pkg.type] ?? pkg.type}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {new Date(pkg.receivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  <span className="text-muted text-lg">›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next reservation */}
        {nextReservation && (
          <div className="mb-8">
            <div className="section-label">
              <span className="section-label-text">Próxima reserva</span>
            </div>
            <div
              className="rounded-card p-5 relative overflow-hidden"
              style={{ background: '#1c3551' }}
            >
              <div
                className="absolute right-[-30px] top-[-20px] w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,.05)' }}
              />
              <span className="pill-primary inline-block mb-3">
                {new Date(nextReservation.startsAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <div className="font-hero text-3xl font-normal leading-tight tracking-tight" style={{ color: '#5b9be8' }}>
                {spaceLabel[nextReservation.spaceType] ?? nextReservation.spaceType}
              </div>
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <div className="section-label">
              <span className="section-label-text">Comunicados</span>
              <Link href="/resident/announcements" className="text-xs font-semibold" style={{ color: '#5b9be8' }}>
                Ver tudo
              </Link>
            </div>
            <div className="card p-0 divide-y divide-hairline overflow-hidden">
              {announcements.map(ann => (
                <div key={ann.id} className="flex items-center gap-3 p-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#2d2618', color: '#d4ad6b' }}
                  >
                    📢
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink truncate">{ann.title}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {new Date(ann.publishedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <span className="text-muted text-lg">›</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
