'use client';
import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { PackageType } from '@condo/shared';

interface Apt { number: string; block?: string; residents: { id: string; name: string }[] }

const TYPE_LABELS: Record<PackageType, string> = {
  BOX: 'Caixa',
  ENVELOPE: 'Envelope',
  BAG: 'Sacola',
};
const TYPE_ICON: Record<PackageType, string> = { BOX: '📦', ENVELOPE: '✉️', BAG: '🛍️' };

export default function GatePage() {
  const router = useRouter();
  const [apts, setApts] = useState<Apt[]>([]);
  const [aptId, setAptId] = useState('');
  const [residentId, setResidentId] = useState('');
  const [type, setType] = useState<PackageType>(PackageType.BOX);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/apartments').then(r => setApts(r.data)).catch(() => router.push('/login'));
  }, [router]);

  const selectedApt = apts.find(a => a.number === aptId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      await api.post('/packages', { apartmentId: aptId, residentId: residentId || undefined, type });
      setSuccess(`Encomenda registrada · AP ${aptId}. WhatsApp enviado!`);
      setAptId(''); setResidentId(''); setType(PackageType.BOX);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative max-w-md">
        <div className="mb-6">
          <h1 className="font-hero text-4xl font-normal leading-tight tracking-tight">
            Registrar<br />
            <em className="italic" style={{ color: '#5b9be8' }}>encomenda.</em>
          </h1>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          {/* Apartamento */}
          <div>
            <label className="input-label">Apartamento</label>
            <select
              className="input"
              value={aptId}
              onChange={e => { setAptId(e.target.value); setResidentId(''); }}
              required
            >
              <option value="">Selecione o apartamento…</option>
              {apts.map(a => (
                <option key={a.number} value={a.number}>
                  AP {a.number}{a.block ? ` · Bloco ${a.block}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Morador (opcional) */}
          {selectedApt && selectedApt.residents.length > 0 && (
            <div>
              <label className="input-label">Morador (opcional)</label>
              <select className="input" value={residentId} onChange={e => setResidentId(e.target.value)}>
                <option value="">Não especificado</option>
                {selectedApt.residents.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo */}
          <div>
            <label className="input-label">Tipo da encomenda</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(PackageType).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="py-3 rounded-xl text-sm font-semibold border transition-colors flex flex-col items-center gap-1"
                  style={{
                    background: type === t ? '#1c3551' : '#111a2a',
                    color: type === t ? '#5b9be8' : '#5e7188',
                    borderColor: type === t ? '#5b9be8' : '#22324a',
                  }}
                >
                  <span className="text-xl">{TYPE_ICON[t]}</span>
                  <span className="text-xs">{TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {success && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#1a3528', color: '#5fbf86' }}>
              ✓ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !aptId}
            className="btn-primary w-full"
            style={{ padding: '16px 0' }}
          >
            {loading ? 'Registrando…' : '📦 Registrar e notificar'}
          </button>
        </form>
      </div>
    </div>
  );
}
