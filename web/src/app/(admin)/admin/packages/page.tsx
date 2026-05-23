'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Pkg {
  id: string;
  type: string;
  receivedAt: string;
  pickedUpAt?: string;
  apartment: { number: string };
  receivedBy: { name?: string; gateId?: string };
}

const TYPE_LABEL: Record<string, string> = {
  BOX: '📦 Caixa',
  ENVELOPE: '✉️ Envelope',
  BAG: '🛍️ Sacola',
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = () =>
    api.get(`/packages?status=${filter}`).then(r => setPackages(r.data));

  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Encomendas</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            filter === 'pending' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            filter === 'all' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'
          }`}
        >
          Todas
        </button>
      </div>

      <div className="space-y-2">
        {packages.map(pkg => (
          <div key={pkg.id} className="card flex items-center justify-between">
            <div>
              <span className="font-semibold">{TYPE_LABEL[pkg.type] ?? pkg.type}</span>
              <span className="ml-3 text-sm text-gray-500">AP {pkg.apartment.number}</span>
              <div className="text-xs text-gray-400 mt-0.5">
                Recebido em {new Date(pkg.receivedAt).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              {pkg.pickedUpAt ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Retirado
                </span>
              ) : (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  Aguardando
                </span>
              )}
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <p className="text-gray-400 text-sm py-8 text-center">
            {filter === 'pending' ? 'Nenhuma encomenda pendente.' : 'Nenhuma encomenda registrada.'}
          </p>
        )}
      </div>
    </div>
  );
}
