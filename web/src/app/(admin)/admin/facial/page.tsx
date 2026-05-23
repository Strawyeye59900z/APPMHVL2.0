'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Resident {
  id: string;
  name: string;
  photoUrl: string;
  apartmentId: string;
  apartment: { number: string; block?: string };
}

export default function FacialQueuePage() {
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const loadNext = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/facial/queue/next');
      setResident(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNext(); }, []);

  async function markRegistered() {
    if (!resident) return;
    setMarking(true);
    try {
      const { data } = await api.patch(`/facial/residents/${resident.id}/registered`);
      setResident(data);
    } finally {
      setMarking(false);
    }
  }

  async function downloadPhoto() {
    if (!resident) return;
    const a = document.createElement('a');
    a.href = `/api/facial/residents/${resident.id}/photo/download`;
    a.download = `AP${resident.apartmentId}_${resident.name}.jpg`;
    a.click();
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      {/* Topbar */}
      <div className="relative flex items-center gap-4 px-7 py-5 border-b border-hairline">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Acesso & Facial</p>
          <h1 className="font-hero text-3xl font-normal leading-tight text-ink">Fila de cadastro facial</h1>
        </div>
      </div>

      <div className="relative p-7 flex justify-center">
        {loading ? (
          <div className="text-muted text-sm mt-12">Carregando fila…</div>
        ) : !resident ? (
          <div className="card text-center py-16 max-w-sm w-full">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-semibold text-ink">Fila vazia!</p>
            <p className="text-sm text-muted mt-1">Todos os moradores estão cadastrados.</p>
          </div>
        ) : (
          <div className="card w-80 text-center">
            {/* Status badge */}
            <div className="flex justify-center mb-4">
              <span className="pill-primary">Fila de cadastro</span>
            </div>

            {/* AP info */}
            <div className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              AP {resident.apartment.number}
              {resident.apartment.block ? ` · Bloco ${resident.apartment.block}` : ''}
            </div>

            {/* Photo */}
            <div
              className="w-48 h-48 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4"
              style={{ borderColor: '#1c3551' }}
            >
              {resident.photoUrl ? (
                <img src={resident.photoUrl} alt={resident.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-hero text-5xl"
                  style={{ background: '#131f33', color: '#5b9be8' }}
                >
                  {resident.name.charAt(0)}
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-ink mb-1">{resident.name}</h2>
            <p className="text-sm text-muted mb-6">Baixe a foto e registre na leitora do prédio</p>

            <div className="flex gap-3">
              <button onClick={downloadPhoto} className="btn-ghost flex-1 text-sm">
                ⬇ Baixar foto
              </button>
              <button onClick={markRegistered} disabled={marking} className="btn-primary flex-1 text-sm">
                {marking ? '…' : '✓ Registrado'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
