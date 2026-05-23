'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    apartments: 0, pendingPackages: 0, activeReservations: 0, pendingFacial: 0,
  });

  useEffect(() => {
    Promise.all([
      api.get('/apartments'),
      api.get('/packages?status=pending'),
      api.get('/reservations'),
      api.get('/facial/queue/next'),
    ]).then(([apts, pkgs, res, facial]) => {
      setStats({
        apartments: apts.data.length,
        pendingPackages: pkgs.data.length,
        activeReservations: res.data.length,
        pendingFacial: facial.data ? 1 : 0,
      });
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Encomendas aguardando', value: stats.pendingPackages, sub: 'na portaria', href: '/admin/packages', tone: 'primary', icon: '📦' },
    { label: 'Reservas ativas', value: stats.activeReservations, sub: 'este mês', href: '/admin/reservations', tone: 'accent', icon: '📅' },
    { label: 'Apartamentos', value: stats.apartments, sub: 'cadastrados', href: '/admin/apartments', tone: 'ok', icon: '🏢' },
    { label: 'Fotos na fila facial', value: stats.pendingFacial, sub: 'para cadastrar', href: '/admin/facial', tone: 'muted', icon: '🪪' },
  ];

  const toneStyles: Record<string, { bg: string; icon: string; value: string }> = {
    primary: { bg: '#1c3551', icon: '#5b9be8', value: '#5b9be8' },
    accent:  { bg: '#2d2618', icon: '#d4ad6b', value: '#d4ad6b' },
    ok:      { bg: '#1a3528', icon: '#5fbf86', value: '#5fbf86' },
    muted:   { bg: '#131f33', icon: '#a0b2c5', value: '#a0b2c5' },
  };

  const quickLinks = [
    { href: '/admin/apartments',   label: 'Apartamentos',  icon: '🏢' },
    { href: '/admin/residents',    label: 'Moradores',     icon: '👥' },
    { href: '/admin/packages',     label: 'Encomendas',    icon: '📦' },
    { href: '/admin/reservations', label: 'Reservas',      icon: '📅' },
    { href: '/admin/facial',       label: 'Fila Facial',   icon: '🪪' },
    { href: '/admin/announcements',label: 'Comunicados',   icon: '📢' },
    { href: '/admin/reports',      label: 'Relatórios',    icon: '📄' },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      {/* Topbar */}
      <div className="relative flex items-center gap-4 px-7 py-5 border-b border-hairline">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Início</p>
          <h1 className="font-hero text-4xl font-normal leading-tight tracking-tight text-ink">
            Boa tarde, Síndico.
          </h1>
        </div>
        <Link href="/admin/packages" className="btn-primary">
          + Nova encomenda
        </Link>
      </div>

      <div className="relative p-7">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map(s => {
            const tone = toneStyles[s.tone];
            return (
              <Link
                key={s.href}
                href={s.href}
                className="card flex items-center gap-4 hover:brightness-110 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: tone.bg }}
                >
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted truncate">{s.label}</p>
                  <p className="font-hero text-4xl font-normal leading-none mt-1" style={{ color: tone.value }}>
                    {s.value}
                  </p>
                  <p className="text-xs text-muted mt-1">{s.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick access grid */}
        <div className="section-label">
          <span className="section-label-text">Acesso rápido</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map(ql => (
            <Link
              key={ql.href}
              href={ql.href}
              className="card flex flex-col items-center justify-center gap-2 py-6 hover:brightness-110 transition-all hover:border-primary/40 text-center"
            >
              <span className="text-3xl">{ql.icon}</span>
              <span className="text-sm font-semibold text-ink-2">{ql.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
