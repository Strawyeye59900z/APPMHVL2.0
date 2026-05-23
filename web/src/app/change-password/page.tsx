'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Senhas não coincidem'); return; }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    setError('');
    setLoading(true);
    try {
      await api.patch('/auth/change-password', { newPassword: password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0c1422' }}
    >
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
            style={{ background: '#1c3551', color: '#5b9be8' }}
          >
            🔑
          </div>
          <h1 className="font-hero text-3xl font-normal tracking-tight text-ink">
            Nova senha
          </h1>
          <p className="text-sm text-muted mt-2">Defina uma senha segura para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="input-label">Nova senha</label>
            <input
              type="password"
              className="input"
              placeholder="mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="input-label">Confirmar senha</label>
            <input
              type="password"
              className="input"
              placeholder="repita a senha"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#2e2616', color: '#d6a85b' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2" style={{ padding: '16px 0' }}>
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
