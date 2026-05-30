import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import type { Certificate } from '@/types/medical';
import Icon from '@/components/ui/icon';

const certTypes = [
  'Справка о состоянии здоровья',
  'Справка для водительских прав',
  'Справка в бассейн',
  'Справка в учебное заведение',
  'Справка на работу',
  'Справка о временной нетрудоспособности',
  'Выписка из медицинской карты',
  'Медицинское заключение',
  'Справка для санатория',
];

const genNum = () => 'СПР-' + Date.now().toString().slice(-8);

const emptyForm: Omit<Certificate, 'id'> = {
  patientId: '', doctorId: '', type: certTypes[0],
  number: genNum(), issueDate: new Date().toISOString().split('T')[0],
  purpose: '', content: '',
};

export default function CertificatesSection() {
  const { certificates, patients, staff, addCertificate, deleteCertificate } = useMedStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const doctors = staff.filter(s => s.status === 'active');

  const filtered = certificates.filter(c => {
    const p = patients.find(pt => pt.id === c.patientId);
    return `${p?.lastName} ${p?.firstName} ${c.type} ${c.number}`.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => { setForm({ ...emptyForm, number: genNum() }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addCertificate(form);
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по пациенту, типу, номеру..." className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        <button onClick={openAdd} disabled={patients.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'hsl(152,55%,40%)' }}>
          <Icon name="FilePlus" size={16} fallback="Plus" />
          Новая справка
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="med-table-header">
              <th className="px-4 py-3 text-left">Номер</th>
              <th className="px-4 py-3 text-left">Пациент</th>
              <th className="px-4 py-3 text-left">Тип справки</th>
              <th className="px-4 py-3 text-left">Дата выдачи</th>
              <th className="px-4 py-3 text-left">Назначение</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                {search ? 'Справки не найдены' : 'Справки ещё не выданы'}
              </td></tr>
            )}
            {[...filtered].reverse().map((c, i) => {
              const patient = patients.find(p => p.id === c.patientId);
              return (
                <tr key={c.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3 font-mono-med text-xs font-semibold">{c.number}</td>
                  <td className="px-4 py-3 font-medium">{patient ? `${patient.lastName} ${patient.firstName}` : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                  <td className="px-4 py-3 font-mono-med text-xs text-muted-foreground">{c.issueDate}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{c.purpose || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Просмотр">
                        <Icon name="Eye" size={14} fallback="Eye" />
                      </button>
                      <button onClick={() => deleteCertificate(c.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Удалить"><Icon name="Trash2" size={14} fallback="Trash" /></button>
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
              <h3 className="text-base font-bold">Новая справка / выписка</h3>
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
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Тип документа *</label>
                  <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls + ' bg-white'}>
                    {certTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium mb-1">Номер документа</label><input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium mb-1">Дата выдачи</label><input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} className={inputCls} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium mb-1">Назначение справки</label><input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Куда и для чего предназначена" className={inputCls} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium mb-1">Содержание / Текст документа *</label><textarea required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} className={inputCls} placeholder="Введите текст справки или выписки..." /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors">Отмена</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'hsl(152,55%,40%)' }}>
                  {submitting ? 'Сохранение...' : 'Создать документ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}