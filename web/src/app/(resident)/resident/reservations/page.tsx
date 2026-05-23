'use client';
import { useEffect, useState, FormEvent } from 'react';
import api from '@/lib/api';
import { SpaceType } from '@condo/shared';

interface Reservation { id: string; spaceType: string; startsAt: string; endsAt: string; resident: { name: string } }
interface Resident { id: string; name: string }

const SPACE_LABELS: Record<string, string> = {
  COURT: 'Quadra esportiva',
  BBQ:   'Churrasqueira',
  HALL:  'Salão de festas',
};
const SPACE_ICON: Record<string, string> = {
  COURT: '🏸',
  BBQ:   '🔥',
  HALL:  '🎉',
};

export default function ResidentReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [form, setForm] = useState({ spaceType: SpaceType.COURT, residentId: '', startsAt: '', endsAt: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [res, r] = await Promise.all([
      api.get('/reservations/my'),
      api.get('/apartments/my/residents').catch(() => ({ data: [] })),
    ]);
    setReservations(res.data);
    setResidents(r.data);
    if (r.data.length > 0) setForm(f => ({ ...f, residentId: r.data[0].id }));
  };

  useEffect(() => { load(); }, []);

  const isDaily = form.spaceType !== SpaceType.COURT;

  function handleDateChange(date: string) {
    if (isDaily) {
      setForm(f => ({ ...f, startsAt: `${date}T00:00:00`, endsAt: `${date}T23:59:00` }));
    } else {
      setForm(f => ({ ...f, startsAt: `${date}T09:00:00`, endsAt: `${date}T10:00:00` }));
    }
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/reservations', form);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id: string) {
    if (!confirm('Cancelar esta reserva?')) return;
    await api.patch(`/reservations/${id}/cancel`);
    load();
  }

  const active = reservations.filter(r => r.spaceType);

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-hero text-4xl font-normal leading-tight tracking-tight">
              Reserve um<br />
              <em className="italic" style={{ color: '#5b9be8' }}>espaço da casa.</em>
            </h1>
            <p className="text-sm text-muted mt-2">Quatro áreas comuns disponíveis. Até 30 dias de antecedência.</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn-primary shrink-0 mt-1"
          >
            {showForm ? '✕ Fechar' : '+ Reservar'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={create} className="card mb-6 space-y-4">
            <h2 className="font-semibold text-ink">Nova reserva</h2>

            {/* Espaços */}
            <div className="grid grid-cols-3 gap-2">
              {Object.values(SpaceType).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, spaceType: s }))}
                  className="py-3 rounded-xl text-sm font-semibold border transition-colors flex flex-col items-center gap-1"
                  style={{
                    background: form.spaceType === s ? '#1c3551' : '#111a2a',
                    color: form.spaceType === s ? '#5b9be8' : '#5e7188',
                    borderColor: form.spaceType === s ? '#5b9be8' : '#22324a',
                  }}
                >
                  <span className="text-xl">{SPACE_ICON[s]}</span>
                  <span className="text-xs">{SPACE_LABELS[s]}</span>
                </button>
              ))}
            </div>

            {residents.length > 1 && (
              <div>
                <label className="input-label">Para quem?</label>
                <select
                  className="input"
                  value={form.residentId}
                  onChange={e => setForm(f => ({ ...f, residentId: e.target.value }))}
                >
                  {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="input-label">Data</label>
                <input type="date" className="input" onChange={e => handleDateChange(e.target.value)} required />
              </div>
              {!isDaily && (
                <>
                  <div>
                    <label className="input-label">Início</label>
                    <input
                      type="time"
                      className="input"
                      value={form.startsAt.split('T')[1]?.slice(0, 5) ?? ''}
                      onChange={e => setForm(f => ({ ...f, startsAt: `${f.startsAt.split('T')[0]}T${e.target.value}:00` }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Fim</label>
                    <input
                      type="time"
                      className="input"
                      value={form.endsAt.split('T')[1]?.slice(0, 5) ?? ''}
                      onChange={e => setForm(f => ({ ...f, endsAt: `${f.endsAt.split('T')[0]}T${e.target.value}:00` }))}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {isDaily && (
              <p className="text-xs text-muted">Reserva do dia inteiro (00:00 – 23:59)</p>
            )}

            {error && (
              <p className="text-sm rounded-xl p-3" style={{ background: '#2e2616', color: '#d6a85b' }}>{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Reservando…' : '✓ Confirmar reserva'}
            </button>
          </form>
        )}

        {/* Spaces info */}
        {!showForm && (
          <div className="grid gap-3 mb-8">
            {Object.values(SpaceType).map(s => (
              <div key={s} className="card flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: '#1c3551' }}
                >
                  {SPACE_ICON[s]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink">{SPACE_LABELS[s]}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {s === 'COURT' ? 'Blocos de 1h · máx 4h/dia' : 'Reserva do dia inteiro'}
                  </div>
                </div>
                <button
                  onClick={() => { setForm(f => ({ ...f, spaceType: s as SpaceType })); setShowForm(true); }}
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: '#5b9be8' }}
                >
                  RESERVAR →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My reservations */}
        <div className="section-label mt-2">
          <span className="section-label-text">Minhas reservas</span>
        </div>

        {active.length === 0 ? (
          <div className="card text-center py-10 text-muted text-sm">Nenhuma reserva ativa.</div>
        ) : (
          <div className="card p-0 divide-y divide-hairline overflow-hidden">
            {active.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: '#1c3551' }}
                >
                  {SPACE_ICON[r.spaceType] ?? '📅'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink text-sm">{SPACE_LABELS[r.spaceType] ?? r.spaceType}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {new Date(r.startsAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    {' → '}
                    {new Date(r.endsAt).toLocaleString('pt-BR', { timeStyle: 'short' })}
                  </div>
                  <div className="text-xs text-muted">{r.resident?.name}</div>
                </div>
                <button
                  onClick={() => cancel(r.id)}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors shrink-0"
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
