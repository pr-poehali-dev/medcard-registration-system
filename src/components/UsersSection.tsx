import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import type { User } from '@/types/medical';
import Icon from '@/components/ui/icon';

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  doctor: 'Врач',
  nurse: 'Медсестра',
  registrar: 'Регистратор',
};

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  doctor: 'bg-blue-100 text-blue-800',
  nurse: 'bg-teal-100 text-teal-800',
  registrar: 'bg-gray-100 text-gray-700',
};

export default function UsersSection() {
  const { users, registerUser, deleteUser, currentUser } = useMedStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ login: '', password: '', name: '', role: 'doctor' as User['role'], confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.confirmPassword) { setError('Пароли не совпадают'); return; }
    if (form.password.length < 6) { setError('Пароль не менее 6 символов'); return; }
    if (users.find(u => u.login === form.login)) { setError('Логин уже занят'); return; }
    registerUser({ login: form.login, password: form.password, name: form.name, role: form.role });
    setSuccess(`Пользователь «${form.name}» создан`);
    setForm({ login: '', password: '', name: '', role: 'doctor', confirmPassword: '' });
    setShowForm(false);
  };

  const inputCls = "w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Управление учётными записями пользователей системы</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: 'hsl(213,70%,28%)' }}>
            <Icon name="UserPlus" size={16} fallback="Plus" />
            Добавить пользователя
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          <Icon name="CheckCircle" size={16} fallback="Check" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="med-table-header">
              <th className="px-4 py-3 text-left">ФИО</th>
              <th className="px-4 py-3 text-left">Логин</th>
              <th className="px-4 py-3 text-left">Роль</th>
              <th className="px-4 py-3 text-left">Дата регистрации</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-muted/10'} ${u.id === currentUser?.id ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3 font-medium">
                  {u.name}
                  {u.id === currentUser?.id && <span className="ml-2 text-xs text-primary font-normal">(вы)</span>}
                </td>
                <td className="px-4 py-3 font-mono-med text-xs">{u.login}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[u.role]}`}>
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono-med text-xs text-muted-foreground">{u.createdAt}</td>
                <td className="px-4 py-3"><span className="med-badge-active">Активен</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {u.id !== currentUser?.id && currentUser?.role === 'admin' && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Удалить пользователя"
                      >
                        <Icon name="Trash2" size={14} fallback="Trash" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info block */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" fallback="Info" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Экспорт в системы ОМС</p>
            <p className="text-xs text-blue-700">Данные пациентов и реестры осмотров готовы к экспорту в форматы ОМС. Для интеграции с региональной ЕГИСЗ свяжитесь с администратором.</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold">Новый пользователь</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} fallback="X" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-xs font-medium mb-1">ФИО *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Иванов Иван Иванович" /></div>
              <div>
                <label className="block text-xs font-medium mb-1">Роль *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as User['role'] }))} className={inputCls + ' bg-white'}>
                  {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1">Логин *</label><input required value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1">Пароль *</label><input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputCls} placeholder="Мин. 6 символов" /></div>
                <div><label className="block text-xs font-medium mb-1">Повтор *</label><input type="password" required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className={inputCls} /></div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors">Отмена</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: 'hsl(213,70%,28%)' }}>Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}