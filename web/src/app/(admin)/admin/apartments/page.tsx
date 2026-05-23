'use client';
import { useEffect, useState, FormEvent } from 'react';
import api from '@/lib/api';

interface Apt { number: string; block?: string; _count: { packages: number }; residents: { name: string; isOwner: boolean }[] }

export default function ApartmentsPage() {
  const [apts, setApts] = useState<Apt[]>([]);
  const [form, setForm] = useState({ number: '', block: '', defaultPassword: '' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/apartments').then(r => setApts(r.data));
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/apartments', form);
      setForm({ number: '', block: '', defaultPassword: '' });
      load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0c1422' }}>
      <div className="flex items-center gap-4 px-7 py-5 border-b border-hairline">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Gestão</p>
          <h1 className="font-hero text-3xl font-normal leading-tight text-ink">Apartamentos</h1>
        </div>
      </div>
      <div className="p-7">
      <form onSubmit={create} className="card mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Número</label>
          <input className="input w-28" value={form.number} onChange={e => setForm(f => ({...f, number: e.target.value}))} placeholder="101" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bloco (opcional)</label>
          <input className="input w-24" value={form.block} onChange={e => setForm(f => ({...f, block: e.target.value}))} placeholder="A" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha inicial</label>
          <input className="input w-40" value={form.defaultPassword} onChange={e => setForm(f => ({...f, defaultPassword: e.target.value}))} placeholder="mínimo 6 chars" required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Criando...' : '+ Adicionar'}
        </button>
      </form>

      <div className="space-y-3">
        {apts.map(apt => (
          <div key={apt.number} className="card flex items-center justify-between">
            <div>
              <span className="font-bold text-lg">AP {apt.number}</span>
              {apt.block && <span className="ml-2 text-gray-500">Bloco {apt.block}</span>}
              <div className="text-sm text-gray-500 mt-1">
                {apt.residents.length > 0
                  ? apt.residents.map(r => r.name).join(', ')
                  : 'Sem moradores cadastrados'}
              </div>
            </div>
            <div className="text-right">
              {apt._count.packages > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                  {apt._count.packages} encomenda{apt._count.packages > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
