import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import Icon from '@/components/ui/icon';

export default function LoginPage() {
  const { login } = useMedStore();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(form.login, form.password);
    setLoading(false);
    if (!ok) setError('Неверный логин или пароль');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(213, 55%, 14%)' }}>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, white 40px, white 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, white 40px, white 41px)'
      }} />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4" style={{ background: 'hsl(196, 80%, 42%)' }}>
            <Icon name="Cross" size={32} className="text-white" fallback="Plus" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">МедЦентр</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(213, 20%, 65%)' }}>
            Медицинская информационная система
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-base font-bold text-foreground mb-6">Вход в систему</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Логин</label>
              <input
                type="text"
                value={form.login}
                onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Введите логин"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Пароль</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Введите пароль"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'hsl(213, 70%, 28%)' }}
            >
              {loading && <Icon name="Loader2" size={16} className="animate-spin" fallback="Loader" />}
              {loading ? 'Загрузка данных...' : 'Войти в систему'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}