'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Package { id: string; type: string; receivedAt: string; receivedBy: { gateId?: string } }
interface Resident { id: string; name: string }

const TYPE_LABELS: Record<string, string> = {
  BOX: 'Caixa',
  ENVELOPE: 'Envelope',
  BAG: 'Sacola',
};
const TYPE_ICON: Record<string, string> = {
  BOX: '📦',
  ENVELOPE: '✉️',
  BAG: '🛍️',
};

export default function ResidentPackagesPage() {
  const [pending, setPending] = useState<Package[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [pickupResident, setPickupResident] = useState('');
  const [pickingUp, setPickingUp] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const load = async () => {
    const [pkgs, res] = await Promise.all([
      api.get('/packages?status=pending'),
      api.get('/apartments/my/residents').catch(() => ({ data: [] })),
    ]);
    setPending(pkgs.data);
    setResidents(res.data);
    if (res.data.length > 0 && !pickupResident) setPickupResident(res.data[0].id);
  };

  useEffect(() => { load(); }, []);

  async function pickup(id: string) {
    setPickingUp(id);
    try {
      await api.patch(`/packages/${id}/pickup`, { residentId: pickupResident });
      load();
    } finally {
      setPickingUp(null);
    }
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative p-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-hero text-4xl font-normal leading-tight tracking-tight">
            {pending.length > 0 ? `${pending.length} esperando` : 'Sem pendências'}<br />
            <em className="italic" style={{ color: '#5b9be8' }}>por você.</em>
          </h1>
        </div>

        {/* Segmented tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: '#111a2a' }}>
          {(['pending', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-[10px] transition-colors"
              style={{
                background: tab === t ? '#172335' : 'transparent',
                color: tab === t ? '#e8eef5' : '#5e7188',
              }}
            >
              {t === 'pending'
                ? <>Pendentes <span style={{ color: '#5b9be8' }}>·{pending.length}</span></>
                : 'Histórico'}
            </button>
          ))}
        </div>

        {tab === 'pending' && (
          <>
            {/* Picker de morador */}
            {residents.length > 1 && (
              <div className="card mb-4">
                <label className="input-label">Quem está retirando?</label>
                <select
                  className="input"
                  value={pickupResident}
                  onChange={e => setPickupResident(e.target.value)}
                >
                  {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}

            {pending.length === 0 ? (
              <div className="card text-center py-12 text-muted">
                Nenhuma encomenda pendente.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Primeiro item — card grande com QR visual */}
                {pending[0] && (
                  <div className="card p-0 overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {/* QR placeholder */}
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl shrink-0"
                        style={{ background: '#e8eef5' }}
                      >
                        🔲
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="pill-primary inline-block mb-2">Aguardando · hoje</span>
                        <div className="font-bold text-lg text-ink">
                          {TYPE_ICON[pending[0].type]} {TYPE_LABELS[pending[0].type]}
                        </div>
                        <div className="text-xs text-muted mt-1 flex items-center gap-1">
                          🕐 {new Date(pending[0].receivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between px-4 py-3 text-sm border-t border-hairline"
                      style={{ background: '#111a2a' }}
                    >
                      <span className="text-ink-2">Mostre o QR na portaria</span>
                      <button
                        onClick={() => pickup(pending[0].id)}
                        disabled={pickingUp === pending[0].id}
                        className="font-bold"
                        style={{ color: '#5b9be8' }}
                      >
                        {pickingUp === pending[0].id ? '...' : 'Confirmar retirada →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Demais itens — compactos */}
                {pending.slice(1).map(pkg => (
                  <div key={pkg.id} className="card flex items-center gap-4">
                    <span className="text-3xl">{TYPE_ICON[pkg.type] ?? '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink">{TYPE_LABELS[pkg.type] ?? pkg.type}</div>
                      <div className="text-xs text-muted mt-0.5">
                        {new Date(pkg.receivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    <button
                      onClick={() => pickup(pkg.id)}
                      disabled={pickingUp === pkg.id}
                      className="text-sm font-bold"
                      style={{ color: '#5b9be8' }}
                    >
                      {pickingUp === pkg.id ? '...' : 'Retirado ✓'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="card p-0 divide-y divide-hairline overflow-hidden">
            <div className="flex items-center gap-3 p-4 opacity-50">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1a3528', color: '#5fbf86' }}>✓</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">Histórico carregando…</div>
                <div className="text-xs text-muted">API /packages?status=all</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
