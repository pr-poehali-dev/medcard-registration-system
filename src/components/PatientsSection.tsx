import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import type { Patient } from '@/types/medical';
import Icon from '@/components/ui/icon';

const emptyPatient: Omit<Patient, 'id' | 'registeredAt'> = {
  lastName: '', firstName: '', middleName: '', birthDate: '', gender: 'male',
  snils: '', policyOms: '', passport: '', address: '', phone: '', email: '',
  bloodGroup: '', allergies: '', chronicDiseases: '',
};

export default function PatientsSection() {
  const { patients, addPatient, updatePatient, deletePatient } = useMedStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPatient);
  const [submitting, setSubmitting] = useState(false);

  const filtered = patients.filter(p =>
    `${p.lastName} ${p.firstName} ${p.middleName} ${p.snils} ${p.policyOms}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyPatient); setEditId(null); setShowForm(true); };
  const openEdit = (p: Patient) => { const { id, registeredAt, ...rest } = p; setForm(rest); setEditId(p.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) await updatePatient(editId, form);
      else await addPatient(form);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fallback="Search" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по ФИО, СНИЛС, полису..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: 'hsl(213,70%,28%)' }}>
          <Icon name="UserPlus" size={16} fallback="Plus" />
          Добавить пациента
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="med-table-header">
              <th className="px-4 py-3 text-left">ФИО</th>
              <th className="px-4 py-3 text-left">Дата рождения</th>
              <th className="px-4 py-3 text-left">Полис ОМС</th>
              <th className="px-4 py-3 text-left">Телефон</th>
              <th className="px-4 py-3 text-left">Зарегистрирован</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                {search ? 'Пациенты не найдены' : 'Пациенты не зарегистрированы'}
              </td></tr>
            )}
            {filtered.map((p, i) => (
              <tr key={p.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                <td className="px-4 py-3 font-medium">{p.lastName} {p.firstName} {p.middleName}</td>
                <td className="px-4 py-3 font-mono-med text-xs text-muted-foreground">{p.birthDate}</td>
                <td className="px-4 py-3 font-mono-med text-xs">{p.policyOms || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone || '—'}</td>
                <td className="px-4 py-3 font-mono-med text-xs text-muted-foreground">{p.registeredAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Редактировать">
                      <Icon name="Pencil" size={14} fallback="Edit" />
                    </button>
                    <button onClick={() => deletePatient(p.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Удалить">
                      <Icon name="Trash2" size={14} fallback="Trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold">{editId ? 'Редактирование пациента' : 'Новый пациент'}</h3>
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
                  <div><label className="block text-xs font-medium mb-1">Дата рождения *</label><input type="date" required value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} className={inputCls} /></div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Пол</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'male' | 'female' }))} className={inputCls + ' bg-white'}>
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Документы</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium mb-1">СНИЛС</label><input value={form.snils} onChange={e => setForm(f => ({ ...f, snils: e.target.value }))} placeholder="000-000-000 00" className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Полис ОМС</label><input value={form.policyOms} onChange={e => setForm(f => ({ ...f, policyOms: e.target.value }))} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Паспорт</label><input value={form.passport} onChange={e => setForm(f => ({ ...f, passport: e.target.value }))} placeholder="Серия и номер" className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Группа крови</label>
                    <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className={inputCls + ' bg-white'}>
                      <option value="">Не указано</option>
                      {['I(O)+', 'I(O)−', 'II(A)+', 'II(A)−', 'III(B)+', 'III(B)−', 'IV(AB)+', 'IV(AB)−'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Контакты</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium mb-1">Телефон</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (000) 000-00-00" className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
                  <div className="col-span-2"><label className="block text-xs font-medium mb-1">Адрес регистрации</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} /></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Медицинские сведения</h4>
                <div className="space-y-3">
                  <div><label className="block text-xs font-medium mb-1">Аллергии</label><textarea value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} rows={2} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Хронические заболевания</label><textarea value={form.chronicDiseases} onChange={e => setForm(f => ({ ...f, chronicDiseases: e.target.value }))} rows={2} className={inputCls} /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors">Отмена</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'hsl(213,70%,28%)' }}>
                  {submitting ? 'Сохранение...' : (editId ? 'Сохранить' : 'Зарегистрировать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}