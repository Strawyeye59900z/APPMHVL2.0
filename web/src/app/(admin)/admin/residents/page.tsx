'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Resident {
  id: string;
  name: string;
  phone?: string;
  isOwner: boolean;
  facialStatus: string;
  active: boolean;
  apartmentId: string;
}

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState('');

  const load = () =>
    api.get('/residents').then(r => setResidents(r.data));

  useEffect(() => { load(); }, []);

  async function toggleActive(id: string, active: boolean) {
    await api.patch(`/residents/${id}`, { active: !active });
    load();
  }

  const filtered = residents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.apartmentId.includes(search),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Moradores</h1>

      <input
        className="input mb-4 w-full max-w-xs"
        placeholder="Buscar por nome ou AP..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map(r => (
          <div key={r.id} className="card flex items-center justify-between">
            <div>
              <span className="font-semibold">{r.name}</span>
              {r.isOwner && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Proprietário</span>
              )}
              <div className="text-sm text-gray-500 mt-0.5">
                AP {r.apartmentId}
                {r.phone && <span className="ml-3">{r.phone}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                r.facialStatus === 'REGISTERED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {r.facialStatus === 'REGISTERED' ? 'Facial OK' : 'Facial Pendente'}
              </span>
              <button
                onClick={() => toggleActive(r.id, r.active)}
                className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                  r.active
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                {r.active ? 'Desativar' : 'Reativar'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm py-8 text-center">Nenhum morador encontrado.</p>
        )}
      </div>
    </div>
  );
}
