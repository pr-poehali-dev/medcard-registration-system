import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import type { Examination } from '@/types/medical';
import Icon from '@/components/ui/icon';

const examTypes = ['Первичный осмотр', 'Повторный осмотр', 'Профилактический осмотр', 'Диспансеризация', 'Срочный приём', 'Плановый осмотр', 'Консультация'];

const emptyExam: Omit<Examination, 'id'> = {
  patientId: '', doctorId: '', date: new Date().toISOString().split('T')[0], time: '',
  type: 'Первичный осмотр', complaints: '', anamnesis: '', objectiveStatus: '',
  diagnosis: '', icdCode: '', recommendations: '', prescriptions: '', nextVisit: '',
};

export default function ExaminationsSection() {
  const { examinations, patients, staff, addExamination, updateExamination, deleteExamination } = useMedStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyExam);
  const [submitting, setSubmitting] = useState(false);

  const doctors = staff.filter(s => s.status === 'active');

  const filtered = examinations.filter(e => {
    const patient = patients.find(p => p.id === e.patientId);
    const doctor = staff.find(s => s.id === e.doctorId);
    const text = `${patient?.lastName} ${patient?.firstName} ${doctor?.lastName} ${e.diagnosis} ${e.type}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const openAdd = () => { setForm(emptyExam); setEditId(null); setShowForm(true); };
  const openEdit = (e: Examination) => { const { id, ...rest } = e; setForm(rest); setEditId(e.id); setShowForm(true); };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitting(true);
    try {
      if (editId) await updateExamination(editId, form);
      else await addExamination(form);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fallback="Search" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по пациенту, врачу, диагнозу..." className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        <button onClick={openAdd} disabled={patients.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'hsl(213,70%,28%)' }}>
          <Icon name="Plus" size={16} fallback="Plus" />
          Новый осмотр
        </button>
      </div>

      {patients.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <Icon name="AlertTriangle" size={16} fallback="AlertTriangle" />
          Сначала зарегистрируйте пациентов в разделе «Пациенты»
        </div>
      )}

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="med-table-header">
              <th className="px-4 py-3 text-left">Дата / Время</th>
              <th className="px-4 py-3 text-left">Пациент</th>
              <th className="px-4 py-3 text-left">Врач</th>
              <th className="px-4 py-3 text-left">Тип</th>
              <th className="px-4 py-3 text-left">Диагноз</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                {search ? 'Осмотры не найдены' : 'Осмотры не добавлены'}
              </td></tr>
            )}
            {[...filtered].reverse().map((e, i) => {
              const patient = patients.find(p => p.id === e.patientId);
              const doctor = staff.find(s => s.id === e.doctorId);
              return (
                <tr key={e.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3">
                    <div className="font-mono-med text-xs text-foreground">{e.date}</div>
                    {e.time && <div className="font-mono-med text-xs text-muted-foreground">{e.time}</div>}
                  </td>
                  <td className="px-4 py-3 font-medium">{patient ? `${patient.lastName} ${patient.firstName}` : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doctor ? `${doctor.lastName} ${doctor.firstName}` : '—'}</td>
                  <td className="px-4 py-3"><span className="med-badge-active">{e.type}</span></td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{e.diagnosis || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Icon name="Pencil" size={14} fallback="Edit" /></button>
                      <button onClick={() => deleteExamination(e.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Удалить"><Icon name="Trash2" size={14} fallback="Trash" /></button>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold">{editId ? 'Редактирование осмотра' : 'Новый осмотр'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} fallback="X" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Пациент *</label>
                  <select required value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className={inputCls + ' bg-white'}>
                    <option value="">Выберите пациента</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.lastName} {p.firstName} {p.middleName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Врач *</label>
                  <select required value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className={inputCls + ' bg-white'}>
                    <option value="">Выберите врача</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.lastName} {d.firstName} — {d.position}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Дата *</label>
                  <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Время</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Тип осмотра</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls + ' bg-white'}>
                    {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Клинические данные</h4>
                <div className="space-y-3">
                  <div><label className="block text-xs font-medium mb-1">Жалобы</label><textarea value={form.complaints} onChange={e => setForm(f => ({ ...f, complaints: e.target.value }))} rows={2} className={inputCls} placeholder="Опишите жалобы пациента" /></div>
                  <div><label className="block text-xs font-medium mb-1">Анамнез</label><textarea value={form.anamnesis} onChange={e => setForm(f => ({ ...f, anamnesis: e.target.value }))} rows={2} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Объективный статус</label><textarea value={form.objectiveStatus} onChange={e => setForm(f => ({ ...f, objectiveStatus: e.target.value }))} rows={2} className={inputCls} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium mb-1">Диагноз *</label><input required value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium mb-1">Код МКБ-10</label><input value={form.icdCode} onChange={e => setForm(f => ({ ...f, icdCode: e.target.value }))} placeholder="Например: J06.9" className={inputCls} /></div>
                  </div>
                  <div><label className="block text-xs font-medium mb-1">Назначения / Рецепты</label><textarea value={form.prescriptions} onChange={e => setForm(f => ({ ...f, prescriptions: e.target.value }))} rows={2} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Рекомендации</label><textarea value={form.recommendations} onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))} rows={2} className={inputCls} /></div>
                  <div><label className="block text-xs font-medium mb-1">Следующий визит</label><input type="date" value={form.nextVisit} onChange={e => setForm(f => ({ ...f, nextVisit: e.target.value }))} className={inputCls} /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors">Отмена</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'hsl(213,70%,28%)' }}>
                  {submitting ? 'Сохранение...' : (editId ? 'Сохранить' : 'Создать осмотр')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}