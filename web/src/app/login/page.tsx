'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserRole } from '@condo/shared';

const ROLE_TABS: { role: UserRole; label: string; hint: string; placeholder: string }[] = [
  { role: UserRole.ADMIN,     label: 'Síndico',  hint: 'E-mail',       placeholder: 'email@condominio.com' },
  { role: UserRole.GATE,      label: 'Portaria', hint: 'ID da portaria', placeholder: 'ex.: P01' },
  { role: UserRole.RESIDENT,  label: 'Morador',  hint: 'Nº do apartamento', placeholder: 'ex.: 101' },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(UserRole.RESIDENT);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activeTab = ROLE_TABS.find(t => t.role === role)!;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { identifier, password, role });
      if (data.mustChangePassword) {
        router.push('/change-password');
        return;
      }
      const redirects: Record<UserRole, string> = {
        ADMIN: '/admin',
        GATE: '/gate',
        RESIDENT: '/resident',
      };
      router.push(redirects[data.role as UserRole]);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0c1422' }}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none hero-glow" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(91,155,232,.08) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center font-hero text-3xl"
            style={{ background: '#1c3551', color: '#5b9be8' }}
          >
            MH
          </div>
          <h1 className="font-hero text-3xl font-normal tracking-tight text-ink">
            Mansão Heitor<br />
            <em className="italic" style={{ color: '#5b9be8' }}>Villa Lobos.</em>
          </h1>
          <p className="text-sm text-muted mt-2">Sistema condominial</p>
        </div>

        {/* Role selector */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-6"
          style={{ background: '#111a2a' }}
        >
          {ROLE_TABS.map(tab => (
            <button
              key={tab.role}
              onClick={() => { setRole(tab.role); setIdentifier(''); setError(''); }}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors"
              style={{
                background: role === tab.role ? '#172335' : 'transparent',
                color: role === tab.role ? '#e8eef5' : '#5e7188',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="input-label">{activeTab.hint}</label>
            <input
              className="input"
              placeholder={activeTab.placeholder}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="input-label">Senha</label>
            <input
              type="password"
              className="input"
              placeholder="••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: '#2e2616', color: '#d6a85b' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
            style={{ padding: '16px 0', fontSize: '16px' }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-8">
          Problemas com acesso? Contate a portaria.
        </p>
      </div>
    </div>
  );
}
