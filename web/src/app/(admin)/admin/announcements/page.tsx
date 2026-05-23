'use client';
import { useEffect, useState, FormEvent } from 'react';
import api from '@/lib/api';

interface Announcement { id: string; title: string; body: string; publishedAt: string; sentToWhatsapp: boolean }

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: '', body: '', sendToWhatsapp: false });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);

  const load = () => api.get('/announcements').then(r => { setItems(r.data); if (r.data[0]) setSelected(r.data[0]); });
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', form);
      setForm({ title: '', body: '', sendToWhatsapp: false });
      load();
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(date: string) {
    const h = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
    if (h < 1) return 'agora';
    if (h < 24) return `há ${h}h`;
    const d = Math.floor(h / 24);
    return d < 7 ? `${d} dia${d > 1 ? 's' : ''} atrás` : new Date(date).toLocaleDateString('pt-BR');
  }

  return (
    <div className="min-h-screen" style={{ background: '#0c1422' }}>
      {/* Topbar */}
      <div className="flex items-center gap-4 px-7 py-5 border-b border-hairline">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Comunicados</p>
          <h1 className="font-hero text-3xl font-normal leading-tight text-ink">O que está acontecendo</h1>
        </div>
      </div>

      <div className="grid p-7 gap-6" style={{ gridTemplateColumns: '360px 1fr' }}>
        {/* Lista esquerda */}
        <div>
          {/* Form novo */}
          <form onSubmit={create} className="card mb-4 space-y-3">
            <h2 className="font-semibold text-sm text-ink-2 uppercase tracking-widest">Novo comunicado</h2>
            <input
              className="input"
              placeholder="Título"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <textarea
              className="input"
              style={{ minHeight: 80, resize: 'vertical' }}
              placeholder="Mensagem…"
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              required
            />
            <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.sendToWhatsapp}
                onChange={e => setForm(f => ({ ...f, sendToWhatsapp: e.target.checked }))}
              />
              Enviar via WhatsApp para todos
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Publicando…' : '📢 Publicar'}
            </button>
          </form>

          {/* Lista */}
          <div className="card p-0 overflow-hidden divide-y divide-hairline">
            {items.map(ann => (
              <button
                key={ann.id}
                onClick={() => setSelected(ann)}
                className="w-full flex gap-3 p-4 text-left transition-colors hover:brightness-110 relative"
                style={{
                  background: selected?.id === ann.id ? 'rgba(91,155,232,.12)' : 'transparent',
                  borderLeft: selected?.id === ann.id ? '3px solid #5b9be8' : '3px solid transparent',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#2d2618', color: '#d4ad6b' }}
                >
                  📢
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted uppercase tracking-wide font-bold mb-0.5 flex items-center gap-1.5">
                    Comunicado
                    {ann.sentToWhatsapp && (
                      <span className="pill-ok">WhatsApp</span>
                    )}
                  </div>
                  <div className="font-semibold text-sm text-ink truncate">{ann.title}</div>
                  <div className="text-xs text-muted mt-0.5">{timeAgo(ann.publishedAt)}</div>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="p-6 text-center text-muted text-sm">Nenhum comunicado publicado.</div>
            )}
          </div>
        </div>

        {/* Leitura direita */}
        {selected ? (
          <div className="card h-fit">
            <div className="flex items-center gap-2 mb-4">
              <span className="pill-accent">Comunicado</span>
              {selected.sentToWhatsapp && <span className="pill-ok">WhatsApp ✓</span>}
              <span className="flex-1" />
              <span className="text-xs text-muted">{timeAgo(selected.publishedAt)}</span>
            </div>
            <h2 className="font-hero text-3xl font-normal leading-tight tracking-tight text-ink mb-4">
              {selected.title}
            </h2>
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
          </div>
        ) : (
          <div className="card flex items-center justify-center text-muted text-sm" style={{ minHeight: 200 }}>
            Selecione um comunicado para ler
          </div>
        )}
      </div>
    </div>
  );
}
