'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Reservation {
  id: string;
  spaceType: string;
  startsAt: string;
  endsAt: string;
  status: string;
  apartment: { number: string };
  resident: { name: string };
}

const SPACE_LABEL: Record<string, string> = {
  COURT: '🎾 Quadra',
  BBQ: '🔥 Churrasqueira',
  HALL: '🎉 Salão',
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const [year, m] = month.split('-');
    const from = `${year}-${m}-01`;
    const lastDay = new Date(Number(year), Number(m), 0).getDate();
    const to = `${year}-${m}-${lastDay}`;
    api.get(`/reservations?from=${from}&to=${to}`).then(r => setReservations(r.data));
  }, [month]);

  async function cancel(id: string) {
    if (!confirm('Cancelar esta reserva?')) return;
    await api.patch(`/reservations/${id}/cancel`);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
  }

  const active = reservations.filter(r => r.status === 'ACTIVE');
  const cancelled = reservations.filter(r => r.status === 'CANCELLED');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reservas</h1>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium">Mês:</label>
        <input
          type="month"
          className="input"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
        <span className="text-sm text-gray-500">{active.length} ativa{active.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {reservations.length === 0 && (
          <p className="text-gray-400 text-sm py-8 text-center">Nenhuma reserva neste período.</p>
        )}
        {reservations.map(r => (
          <div
            key={r.id}
            className={`card flex items-center justify-between ${
              r.status === 'CANCELLED' ? 'opacity-50' : ''
            }`}
          >
            <div>
              <span className="font-semibold">{SPACE_LABEL[r.spaceType] ?? r.spaceType}</span>
              <span className="ml-3 text-sm text-gray-500">AP {r.apartment.number} — {r.resident.name}</span>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(r.startsAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                {' → '}
                {new Date(r.endsAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.status === 'CANCELLED' ? (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Cancelada</span>
              ) : (
                <>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Ativa</span>
                  <button
                    onClick={() => cancel(r.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
