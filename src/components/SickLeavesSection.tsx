import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import type { SickLeave } from '@/types/medical';
import Icon from '@/components/ui/icon';

const genNum = () => 'БЛ-' + Date.now().toString().slice(-8);

const emptyForm: Omit<SickLeave, 'id'> = {
  patientId: '', doctorId: '', number: genNum(),
  issueDate: new Date().toISOString().split('T')[0],
  fromDate: '', toDate: '', diagnosis: '', icdCode: '',
  employer: '', reason: 'Заболевание', status: 'open',
};

const reasons = ['Заболевание', 'Травма', 'Уход за ребёнком', 'Уход за больным членом семьи', 'Карантин', 'Протезирование', 'Долечивание в санатории'];

export default function SickLeavesSection() {
  const { sickLeaves, patients, staff, addSickLeave, updateSickLeave } = useMedStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const doctors = staff.filter(s => s.status === 'active');

  const filtered = sickLeaves.filter(s => {
    const p = patients.find(pt => pt.id === s.patientId);
    return `${p?.lastName} ${p?.firstName} ${s.number} ${s.diagnosis}`.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => { setForm({ ...emptyForm, number: genNum() }); setEditId(null); setShowForm(true); };
  const openEdit = (s: SickLeave) => { const { id, ...rest } = s; setForm(rest); setEditId(s.id); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateSickLeave(editId, form);
    else addSickLeave(form);
    setShowForm(false);
  };

  const statusColors = { open: 'med-badge-warning', closed: 'med-badge-inactive', extended: 'med-badge-active' };
  const statusLabels = { open: 'Открыт', closed: 'Закрыт', extended: 'Продлён' };

  const inputCls = "w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fallback="Search" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по пациенту, номеру, диагнозу..." className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        <button onClick={openAdd} disabled={patients.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'hsl(36,90%,50%)' }}>
          <Icon name="FilePlus" size={16} fallback="Plus" />
          Новый больничный
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Открытых', count: sickLeaves.filter(s => s.status === 'open').length, cls: 'border-amber-200 bg-amber-50', textCls: 'text-amber-800' },
          { label: 'Продлённых', count: sickLeaves.filter(s => s.status === 'extended').length, cls: 'border-blue-200 bg-blue-50', textCls: 'text-blue-800' },
          { label: 'Закрытых', count: sickLeaves.filter(s => s.status === 'closed').length, cls: 'border-gray-200 bg-gray-50', textCls: 'text-gray-600' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-lg border ${stat.cls} px-4 py-3 text-center`}>
            <div className={`text-2xl font-bold font-mono-med ${stat.textCls}`}>{stat.count}</div>
            <div className={`text-xs font-medium ${stat.textCls}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="med-table-header">
              <th className="px-4 py-3 text-left">Номер</th>
              <th className="px-4 py-3 text-left">Пациент</th>
              <th className="px-4 py-3 text-left">Период</th>
              <th className="px-4 py-3 text-left">Диагноз</th>
              <th className="px-4 py-3 text-left">Причина</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                {search ? 'Больничные не найдены' : 'Больничные листы не выданы'}
              </td></tr>
            )}
            {[...filtered].reverse().map((sl, i) => {
              const patient = patients.find(p => p.id === sl.patientId);
              return (
                <tr key={sl.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3 font-mono-med text-xs font-semibold">{sl.number}</td>
                  <td className="px-4 py-3 font-medium">{patient ? `${patient.lastName} ${patient.firstName}` : '—'}</td>
                  <td className="px-4 py-3 font-mono-med text-xs">
                    <div>{sl.fromDate}</div>
                    <div className="text-muted-foreground">— {sl.toDate}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{sl.diagnosis}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sl.reason}</td>
                  <td className="px-4 py-3"><span className={statusColors[sl.status]}>{statusLabels[sl.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(sl)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Icon name="Pencil" size={14} fallback="Edit" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold">{editId ? 'Редактирование больничного' : 'Новый больничный лист'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} fallback="X" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Пациент *</label>
                  <select required value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className={inputCls + ' bg-white'}>
                    <option value="">Выберите пациента</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Врач *</label>
                  <select required value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className={inputCls + ' bg-white'}>
                    <option value="">Выберите врача</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.lastName} {d.firstName}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium mb-1">Номер листа</label><input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium mb-1">Дата выдачи</label><input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium mb-1">Дата начала *</label><input type="date" required value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium mb-1">Дата окончания *</label><input type="date" required value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium mb-1">Диагноз *</label><input required value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium mb-1">Код МКБ-10</label><input value={form.icdCode} onChange={e => setForm(f => ({ ...f, icdCode: e.target.value }))} placeholder="J06.9" className={inputCls} /></div>
                <div><label className="block text-xs font-medium mb-1">Причина нетрудоспособности</label>
                  <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className={inputCls + ' bg-white'}>
                    {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium mb-1">Место работы</label><input value={form.employer} onChange={e => setForm(f => ({ ...f, employer: e.target.value }))} className={inputCls} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium mb-1">Статус</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as SickLeave['status'] }))} className={inputCls + ' bg-white'}>
                    <option value="open">Открыт</option>
                    <option value="extended">Продлён</option>
                    <option value="closed">Закрыт</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors">Отмена</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: 'hsl(36,90%,50%)' }}>
                  {editId ? 'Сохранить' : 'Выдать больничный'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
