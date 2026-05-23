'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Announcement { id: string; title: string; body: string; publishedAt: string }

export default function ResidentAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    api.get('/announcements').then(r => setItems(r.data)).catch(() => {});
  }, []);

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return 'agora';
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `há ${days} dia${days > 1 ? 's' : ''}`;
    return new Date(date).toLocaleDateString('pt-BR');
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative p-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-hero text-4xl font-normal leading-tight tracking-tight">
            O que está<br />
            <em className="italic" style={{ color: '#5b9be8' }}>acontecendo.</em>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="card text-center py-12 text-muted">Nenhum comunicado.</div>
        ) : (
          <div className="space-y-3">
            {items.map(ann => (
              <div key={ann.id} className="card relative">
                <div className="flex gap-3 items-start">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#2d2618', color: '#d4ad6b' }}
                  >
                    📢
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-muted mb-1">
                      <span>Comunicado</span>
                      <span>·</span>
                      <span>Administração</span>
                    </div>
                    <h2 className="font-bold text-base text-ink leading-snug">{ann.title}</h2>
                    <p className="text-sm text-ink-2 mt-2 leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                    <p className="text-xs text-muted mt-3">{timeAgo(ann.publishedAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
