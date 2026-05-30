import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import type { User } from '@/types/medical';
import Icon from '@/components/ui/icon';

export default function LoginPage() {
  const { login, registerUser, users } = useMedStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ login: '', password: '', name: '', role: 'doctor' as const, confirmPassword: '' });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(form.login, form.password);
    if (!ok) setError('Неверный логин или пароль');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Пароли не совпадают'); return; }
    if (form.password.length < 6) { setError('Пароль должен быть не менее 6 символов'); return; }
    if (users.find(u => u.login === form.login)) { setError('Пользователь с таким логином уже существует'); return; }
    registerUser({ login: form.login, password: form.password, name: form.name, role: form.role });
    setMode('login');
    setError('');
  };

  const roleLabels: Record<string, string> = {
    admin: 'Администратор',
    doctor: 'Врач',
    nurse: 'Медсестра',
    registrar: 'Регистратор',
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
          <div className="flex border border-border rounded-lg p-1 mb-6 bg-muted">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              Вход
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              Регистрация
            </button>
          </div>

          {mode === 'login' ? (
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
                className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'hsl(213, 70%, 28%)' }}
              >
                Войти в систему
              </button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                По умолчанию: <span className="font-mono-med font-medium">admin / admin123</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">ФИО</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Роль</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as User['role'] }))}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                >
                  {Object.entries(roleLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Логин</label>
                <input
                  type="text"
                  value={form.login}
                  onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Придумайте логин"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Пароль</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Минимум 6 символов"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Повтор</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Повторите пароль"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'hsl(196, 80%, 42%)' }}
              >
                Зарегистрироваться
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}