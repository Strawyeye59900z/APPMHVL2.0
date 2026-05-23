'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Package {
  id: string;
  apartmentId: string;
  type: string;
  receivedAt: string;
  receivedBy: { gateId?: string };
}

const TYPE_LABELS: Record<string, string> = { BOX: 'Caixa', ENVELOPE: 'Envelope', BAG: 'Sacola' };
const TYPE_ICON: Record<string, string>   = { BOX: '📦',  ENVELOPE: '✉️',        BAG: '🛍️' };

export default function PendingPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    api.get('/packages?status=pending').then(r => setPackages(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: '#0c1422' }}>
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative max-w-xl">
        <div className="mb-6">
          <h1 className="font-hero text-4xl font-normal leading-tight tracking-tight">
            {packages.length > 0 ? `${packages.length} pendente${packages.length > 1 ? 's' : ''}` : 'Tudo retirado'}<br />
            <em className="italic" style={{ color: '#5b9be8' }}>na portaria.</em>
          </h1>
        </div>

        {packages.length === 0 ? (
          <div className="card text-center py-12 text-muted">
            Nenhuma encomenda aguardando retirada.
          </div>
        ) : (
          <div className="card p-0 divide-y divide-hairline overflow-hidden">
            {packages.map(pkg => (
              <div key={pkg.id} className="flex items-center gap-4 p-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: '#1c3551' }}
                >
                  {TYPE_ICON[pkg.type] ?? '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink">AP {pkg.apartmentId}</div>
                  <div className="text-sm text-ink-2">{TYPE_LABELS[pkg.type] ?? pkg.type}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {new Date(pkg.receivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <span className="pill-primary">Aguardando</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
