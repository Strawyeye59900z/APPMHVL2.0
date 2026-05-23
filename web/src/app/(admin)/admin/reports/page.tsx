'use client';
import { useState, FormEvent } from 'react';

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(nextMonth);
  const [loading, setLoading] = useState(false);

  async function generate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const a = document.createElement('a');
      a.href = `/api/reports/reservations/pdf?from=${from}&to=${to}`;
      a.target = '_blank';
      a.click();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0c1422' }}>
      {/* Topbar */}
      <div className="flex items-center gap-4 px-7 py-5 border-b border-hairline">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Gestão</p>
          <h1 className="font-hero text-3xl font-normal leading-tight text-ink">Relatórios</h1>
        </div>
      </div>

      <div className="p-7">
        <div className="card max-w-md">
          <h2 className="font-semibold text-ink mb-1">Relatório de Reservas</h2>
          <p className="text-sm text-muted mb-5">Gera um PDF com todas as reservas no período selecionado.</p>
          <form onSubmit={generate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">De</label>
                <input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} required />
              </div>
              <div>
                <label className="input-label">Até</label>
                <input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Gerando…' : '📄 Gerar PDF'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
