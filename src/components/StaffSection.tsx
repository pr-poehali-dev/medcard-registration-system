import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import type { Staff } from '@/types/medical';
import Icon from '@/components/ui/icon';

const emptyStaff: Omit<Staff, 'id'> = {
  lastName: '', firstName: '', middleName: '', birthDate: '',
  position: '', specialization: '', licenseNumber: '', snils: '',
  phone: '', email: '', hireDate: '', status: 'active',
};

const positions = ['Главный врач', 'Терапевт', 'Хирург', 'Педиатр', 'Кардиолог', 'Невролог', 'Гинеколог', 'Офтальмолог', 'Дерматолог', 'Медсестра', 'Старшая медсестра', 'Санитарка', 'Регистратор', 'Заведующий отделением'];

export default function StaffSection() {
  const { staff, addStaff, updateStaff, deleteStaff } = useMedStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStaff);

  const filtered = staff.filter(s =>
    `${s.lastName} ${s.firstName} ${s.position} ${s.specialization}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyStaff); setEditId(null); setShowForm(true); };
  const openEdit = (s: Staff) => { const { id, ...rest } = s; setForm(rest); setEditId(s.id); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateStaff(editId, form);
    else addStaff(form);
    setShowForm(false);
  };

  const inputCls = "w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fallback="Search" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по ФИО, должности..." className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: 'hsl(196,80%,42%)' }}>
          <Icon name="UserPlus" size={16} fallback="Plus" />
          Добавить сотрудника
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="med-table-header">
              <th className="px-4 py-3 text-left">ФИО</th>
              <th className="px-4 py-3 text-left">Должность</th>
              <th className="px-4 py-3 text-left">Специализация</th>
              <th className="px-4 py-3 text-left">Телефон</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                {search ? 'Сотрудники не найдены' : 'Сотрудники не добавлены'}
              </td></tr>
            )}
            {filtered.map((s, i) => (
              <tr key={s.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                <td className="px-4 py-3 font-medium">{s.lastName} {s.firstName} {s.middleName}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.position}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.specialization || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={s.status === 'active' ? 'med-badge-active' : 'med-badge-inactive'}>
                    {s.status === 'active' ? 'Работает' : 'Уволен'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Icon name="Pencil" size={14} fallback="Edit" /></button>
                    <button onClick={() => deleteStaff(s.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"><Icon name="Trash2" size={14} fallback="Trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold">{editId ? 'Редактирование сотрудника' : 'Новый сотрудник'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} fallback="X" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Личные данные</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs font-medium mb-1">Фамилия *</label><input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Имя *</label><input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Отчество</label><input value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="block text-xs font-medium mb-1">Дата рождения</label><input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">СНИЛС</label><input value={form.snils} onChange={e => setForm(f => ({ ...f, snils: e.target.value }))} placeholder="000-000-000 00" className={inputCls} /></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Должность</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Должность *</label>
                    <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className={inputCls + ' bg-white'} required>
                      <option value="">Выберите должность</option>
                      {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-medium mb-1">Специализация</label><input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Номер лицензии</label><input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Дата приёма</label><input type="date" value={form.hireDate} onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))} className={inputCls} /></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Контакты</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium mb-1">Телефон</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Статус</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className={inputCls + ' bg-white'}>
                  <option value="active">Работает</option>
                  <option value="inactive">Уволен</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors">Отмена</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: 'hsl(196,80%,42%)' }}>
                  {editId ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
