import { useState, useRef } from 'react';
import { useMedStore } from '@/store/medStore';
import Icon from '@/components/ui/icon';

type DocType = 'medcard' | 'sickleave' | 'certificate' | 'examination';

export default function PrintSection() {
  const { patients, staff, examinations, sickLeaves, certificates, medicalCards } = useMedStore();
  const [docType, setDocType] = useState<DocType>('medcard');
  const [selectedId, setSelectedId] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(`
      <html><head><title>Печать документа — МедЦентр</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 20mm; color: #000; }
        h1, h2, h3 { font-family: 'Times New Roman', serif; }
        .doc-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .doc-field { margin-bottom: 8px; }
        .doc-label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #000; padding: 4px 8px; font-size: 11pt; }
        .signature-line { margin-top: 40px; display: flex; justify-content: space-between; }
        .sig-block { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 4px; font-size: 10pt; }
        @media print { body { margin: 10mm; } }
      </style></head>
      <body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const getDocumentContent = () => {
    const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

    if (docType === 'medcard' && selectedId) {
      const patient = patients.find(p => p.id === selectedId);
      const card = medicalCards.find(c => c.patientId === selectedId);
      const patientExams = examinations.filter(e => e.patientId === selectedId);
      if (!patient) return null;
      return (
        <div>
          <div className="doc-header">
            <h2>МЕДИЦИНСКАЯ КАРТА АМБУЛАТОРНОГО БОЛЬНОГО</h2>
            <p>№ {card?.cardNumber || '—'} от {card?.createdAt || '—'}</p>
          </div>
          <div className="doc-field"><span className="doc-label">ФИО:</span> {patient.lastName} {patient.firstName} {patient.middleName}</div>
          <div className="doc-field"><span className="doc-label">Дата рождения:</span> {patient.birthDate}</div>
          <div className="doc-field"><span className="doc-label">Пол:</span> {patient.gender === 'male' ? 'Мужской' : 'Женский'}</div>
          <div className="doc-field"><span className="doc-label">СНИЛС:</span> {patient.snils || '—'}</div>
          <div className="doc-field"><span className="doc-label">Полис ОМС:</span> {patient.policyOms || '—'}</div>
          <div className="doc-field"><span className="doc-label">Паспорт:</span> {patient.passport || '—'}</div>
          <div className="doc-field"><span className="doc-label">Адрес:</span> {patient.address || '—'}</div>
          <div className="doc-field"><span className="doc-label">Телефон:</span> {patient.phone || '—'}</div>
          <div className="doc-field"><span className="doc-label">Группа крови:</span> {patient.bloodGroup || '—'}</div>
          <div className="doc-field"><span className="doc-label">Аллергии:</span> {patient.allergies || 'Нет'}</div>
          <div className="doc-field"><span className="doc-label">Хронические заболевания:</span> {patient.chronicDiseases || 'Нет'}</div>
          {patientExams.length > 0 && (
            <>
              <h3 style={{ marginTop: '20px' }}>ИСТОРИЯ ОСМОТРОВ</h3>
              <table>
                <thead><tr><th>Дата</th><th>Врач</th><th>Тип</th><th>Диагноз</th><th>МКБ-10</th></tr></thead>
                <tbody>
                  {patientExams.map(ex => {
                    const doc = staff.find(s => s.id === ex.doctorId);
                    return (
                      <tr key={ex.id}>
                        <td>{ex.date}</td>
                        <td>{doc ? `${doc.lastName} ${doc.firstName[0]}.` : '—'}</td>
                        <td>{ex.type}</td>
                        <td>{ex.diagnosis}</td>
                        <td>{ex.icdCode || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
          <div className="signature-line">
            <div className="sig-block">Врач</div>
            <div className="sig-block">Дата выдачи: {today}</div>
          </div>
        </div>
      );
    }

    if (docType === 'sickleave' && selectedId) {
      const sl = sickLeaves.find(s => s.id === selectedId);
      if (!sl) return null;
      const patient = patients.find(p => p.id === sl.patientId);
      const doctor = staff.find(s => s.id === sl.doctorId);
      return (
        <div>
          <div className="doc-header">
            <h2>ЛИСТОК НЕТРУДОСПОСОБНОСТИ</h2>
            <p>№ {sl.number}</p>
          </div>
          <div className="doc-field"><span className="doc-label">Выдан:</span> {sl.issueDate}</div>
          <div className="doc-field"><span className="doc-label">Застрахованный (пациент):</span> {patient?.lastName} {patient?.firstName} {patient?.middleName}</div>
          <div className="doc-field"><span className="doc-label">Дата рождения:</span> {patient?.birthDate}</div>
          <div className="doc-field"><span className="doc-label">Причина нетрудоспособности:</span> {sl.reason}</div>
          <div className="doc-field"><span className="doc-label">Место работы:</span> {sl.employer || '—'}</div>
          <div className="doc-field"><span className="doc-label">Диагноз:</span> {sl.diagnosis}</div>
          <div className="doc-field"><span className="doc-label">Код МКБ-10:</span> {sl.icdCode || '—'}</div>
          <div className="doc-field"><span className="doc-label">Период нетрудоспособности:</span> с {sl.fromDate} по {sl.toDate}</div>
          <div className="doc-field"><span className="doc-label">Статус:</span> {sl.status === 'open' ? 'Открыт' : sl.status === 'closed' ? 'Закрыт' : 'Продлён'}</div>
          <div className="doc-field"><span className="doc-label">Врач:</span> {doctor?.lastName} {doctor?.firstName} {doctor?.middleName} — {doctor?.position}</div>
          <div className="signature-line">
            <div className="sig-block">Подпись врача</div>
            <div className="sig-block">М.П.</div>
          </div>
        </div>
      );
    }

    if (docType === 'certificate' && selectedId) {
      const cert = certificates.find(c => c.id === selectedId);
      if (!cert) return null;
      const patient = patients.find(p => p.id === cert.patientId);
      const doctor = staff.find(s => s.id === cert.doctorId);
      return (
        <div>
          <div className="doc-header">
            <h2>{cert.type.toUpperCase()}</h2>
            <p>№ {cert.number} от {cert.issueDate}</p>
          </div>
          <div className="doc-field"><span className="doc-label">Выдана:</span> {patient?.lastName} {patient?.firstName} {patient?.middleName}</div>
          <div className="doc-field"><span className="doc-label">Дата рождения:</span> {patient?.birthDate}</div>
          {cert.purpose && <div className="doc-field"><span className="doc-label">Назначение:</span> {cert.purpose}</div>}
          <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #000' }}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{cert.content}</p>
          </div>
          <div className="doc-field"><span className="doc-label">Врач:</span> {doctor?.lastName} {doctor?.firstName} {doctor?.middleName}</div>
          <div className="doc-field"><span className="doc-label">Должность:</span> {doctor?.position}</div>
          <div className="signature-line">
            <div className="sig-block">Подпись врача</div>
            <div className="sig-block">М.П.</div>
          </div>
        </div>
      );
    }

    if (docType === 'examination' && selectedId) {
      const exam = examinations.find(e => e.id === selectedId);
      if (!exam) return null;
      const patient = patients.find(p => p.id === exam.patientId);
      const doctor = staff.find(s => s.id === exam.doctorId);
      return (
        <div>
          <div className="doc-header">
            <h2>ПРОТОКОЛ МЕДИЦИНСКОГО ОСМОТРА</h2>
            <p>{exam.date} {exam.time && `в ${exam.time}`}</p>
          </div>
          <div className="doc-field"><span className="doc-label">Пациент:</span> {patient?.lastName} {patient?.firstName} {patient?.middleName}</div>
          <div className="doc-field"><span className="doc-label">Дата рождения:</span> {patient?.birthDate}</div>
          <div className="doc-field"><span className="doc-label">Врач:</span> {doctor?.lastName} {doctor?.firstName} — {doctor?.position}</div>
          <div className="doc-field"><span className="doc-label">Тип осмотра:</span> {exam.type}</div>
          {exam.complaints && <div className="doc-field"><span className="doc-label">Жалобы:</span> {exam.complaints}</div>}
          {exam.anamnesis && <div className="doc-field"><span className="doc-label">Анамнез:</span> {exam.anamnesis}</div>}
          {exam.objectiveStatus && <div className="doc-field"><span className="doc-label">Объективный статус:</span> {exam.objectiveStatus}</div>}
          <div className="doc-field"><span className="doc-label">Диагноз:</span> {exam.diagnosis}</div>
          {exam.icdCode && <div className="doc-field"><span className="doc-label">Код МКБ-10:</span> {exam.icdCode}</div>}
          {exam.prescriptions && <div className="doc-field"><span className="doc-label">Назначения:</span> {exam.prescriptions}</div>}
          {exam.recommendations && <div className="doc-field"><span className="doc-label">Рекомендации:</span> {exam.recommendations}</div>}
          {exam.nextVisit && <div className="doc-field"><span className="doc-label">Следующий визит:</span> {exam.nextVisit}</div>}
          <div className="signature-line">
            <div className="sig-block">Подпись врача</div>
            <div className="sig-block">Дата: {today}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  const docTypes = [
    { id: 'medcard' as DocType, label: 'Медицинская карта', icon: 'BookOpen' },
    { id: 'sickleave' as DocType, label: 'Больничный лист', icon: 'FileMinus' },
    { id: 'certificate' as DocType, label: 'Справка / Выписка', icon: 'FileText' },
    { id: 'examination' as DocType, label: 'Протокол осмотра', icon: 'ClipboardList' },
  ];

  const getSelectOptions = () => {
    if (docType === 'medcard') return patients.map(p => ({ id: p.id, label: `${p.lastName} ${p.firstName} ${p.middleName}` }));
    if (docType === 'sickleave') return sickLeaves.map(sl => { const p = patients.find(pt => pt.id === sl.patientId); return { id: sl.id, label: `${sl.number} — ${p?.lastName || '?'} ${p?.firstName || ''}` }; });
    if (docType === 'certificate') return certificates.map(c => { const p = patients.find(pt => pt.id === c.patientId); return { id: c.id, label: `${c.number} — ${c.type} — ${p?.lastName || '?'}` }; });
    if (docType === 'examination') return examinations.map(e => { const p = patients.find(pt => pt.id === e.patientId); return { id: e.id, label: `${e.date} — ${p?.lastName || '?'} — ${e.diagnosis}` }; });
    return [];
  };

  const docContent = getDocumentContent();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-4 gap-3">
        {docTypes.map(dt => (
          <button
            key={dt.id}
            onClick={() => { setDocType(dt.id); setSelectedId(''); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-sm font-medium ${docType === dt.id ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground hover:border-primary/30'}`}
          >
            <Icon name={dt.icon} size={22} fallback="FileText" />
            {dt.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-border p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {docType === 'medcard' ? 'Выберите пациента' : docType === 'sickleave' ? 'Выберите больничный лист' : docType === 'certificate' ? 'Выберите справку' : 'Выберите осмотр'}
          </label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="">— Выберите документ —</option>
            {getSelectOptions().map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </div>

        {selectedId && docContent && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Предварительный просмотр</h4>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'hsl(213,70%,28%)' }}
              >
                <Icon name="Printer" size={16} fallback="Printer" />
                Распечатать
              </button>
            </div>
            <div ref={printRef} className="bg-white border border-border rounded-lg p-8 text-sm leading-relaxed print-zone" style={{ fontFamily: 'Times New Roman, serif' }}>
              {docContent}
            </div>
          </div>
        )}

        {!selectedId && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Printer" size={40} className="mx-auto mb-3 opacity-30" fallback="Printer" />
            <p className="text-sm">Выберите документ выше для предварительного просмотра и печати</p>
          </div>
        )}
      </div>
    </div>
  );
}
