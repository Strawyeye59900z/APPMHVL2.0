'use client';
import { useEffect, useState, FormEvent } from 'react';
import api from '@/lib/api';
import { compressPhoto } from '@/lib/compress';

interface Resident { id: string; name: string; phone?: string; isOwner: boolean; facialStatus: string; photoUrl?: string }

export default function ResidentsMgmtPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = () =>
    api.get('/apartments/my/residents').then(r => setResidents(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  async function addResident(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/apartments/my/residents', form);
      setForm({ name: '', phone: '' });
      load();
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto(residentId: string, file: File) {
    setUploading(residentId);
    try {
      const compressed = await compressPhoto(file);
      const formData = new FormData();
      formData.append('photo', compressed, 'photo.jpg');
      await api.post(`/facial/residents/${residentId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      load();
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative p-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-hero text-4xl font-normal leading-tight tracking-tight">
            Sua família<br />
            <em className="italic" style={{ color: '#5b9be8' }}>no condomínio.</em>
          </h1>
          <p className="text-sm text-muted mt-2">Gerencie os moradores do seu apartamento e o cadastro facial.</p>
        </div>

        {/* Adicionar morador */}
        <form onSubmit={addResident} className="card mb-6 space-y-3">
          <h2 className="font-semibold text-sm text-ink-2 uppercase tracking-widest">Adicionar morador</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Nome</label>
              <input
                className="input"
                placeholder="Nome completo"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="input-label">WhatsApp</label>
              <input
                className="input"
                placeholder="11999999999"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adicionando…' : '+ Adicionar morador'}
          </button>
        </form>

        {/* Lista de moradores */}
        {residents.length === 0 ? (
          <div className="card text-center py-10 text-muted text-sm">Nenhum morador cadastrado.</div>
        ) : (
          <div className="card p-0 divide-y divide-hairline overflow-hidden">
            {residents.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden font-hero text-xl"
                  style={{ background: '#1c3551', color: '#5b9be8' }}
                >
                  {r.photoUrl
                    ? <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                    : r.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink">{r.name}</span>
                    {r.isOwner && <span className="pill-primary">Proprietário</span>}
                  </div>
                  {r.phone && <div className="text-xs text-muted mt-0.5">{r.phone}</div>}
                  <div className="mt-1.5">
                    <span className={r.facialStatus === 'REGISTERED' ? 'pill-ok' : 'pill-warn'}>
                      {r.facialStatus === 'REGISTERED' ? '✓ Facial registrado' : '⏳ Facial pendente'}
                    </span>
                  </div>
                </div>

                {/* Upload foto */}
                <label className="cursor-pointer shrink-0">
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-hairline transition-colors hover:border-primary/50"
                    style={{ color: '#5b9be8', background: '#111a2a' }}
                  >
                    {uploading === r.id ? 'Enviando…' : '📷 Foto'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    disabled={uploading === r.id}
                    onChange={e => e.target.files?.[0] && uploadPhoto(r.id, e.target.files[0])}
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
