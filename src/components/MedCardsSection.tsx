import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import Icon from '@/components/ui/icon';

export default function MedCardsSection() {
  const { patients, medicalCards, examinations, staff } = useMedStore();
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const filtered = patients.filter(p =>
    `${p.lastName} ${p.firstName} ${p.middleName} ${p.policyOms}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const card = medicalCards.find(c => c.patientId === selectedPatientId);
  const patientExams = examinations.filter(e => e.patientId === selectedPatientId);

  const bloodGroupColors: Record<string, string> = {
    'I(O)+': 'bg-red-100 text-red-800',
    'I(O)−': 'bg-red-100 text-red-800',
    'II(A)+': 'bg-blue-100 text-blue-800',
    'II(A)−': 'bg-blue-100 text-blue-800',
    'III(B)+': 'bg-green-100 text-green-800',
    'III(B)−': 'bg-green-100 text-green-800',
    'IV(AB)+': 'bg-purple-100 text-purple-800',
    'IV(AB)−': 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="flex gap-4 animate-fade-in h-full">
      {/* Left panel - patient list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fallback="Search" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск пациента..." className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        <div className="bg-white rounded-lg border border-border overflow-hidden flex-1">
          {filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {search ? 'Не найдено' : 'Пациенты не зарегистрированы'}
            </div>
          )}
          {filtered.map(p => {
            const c = medicalCards.find(mc => mc.patientId === p.id);
            const exCount = examinations.filter(e => e.patientId === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${selectedPatientId === p.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/30'}`}
              >
                <div className="font-medium text-sm">{p.lastName} {p.firstName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {c ? `Карта № ${c.cardNumber}` : 'Карта не создана'} · {exCount} осм.
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel - card detail */}
      <div className="flex-1">
        {!selectedPatient ? (
          <div className="bg-white rounded-lg border border-border p-12 flex flex-col items-center gap-3 text-center h-full justify-center">
            <Icon name="BookOpen" size={40} className="text-muted-foreground/40" fallback="FileText" />
            <p className="text-sm font-medium text-muted-foreground">Выберите пациента слева</p>
            <p className="text-xs text-muted-foreground">Для просмотра медицинской карты</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Patient header */}
            <div className="bg-white rounded-lg border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">{selectedPatient.lastName} {selectedPatient.firstName} {selectedPatient.middleName}</h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span>Д.р.: {selectedPatient.birthDate}</span>
                    <span>·</span>
                    <span>{selectedPatient.gender === 'male' ? 'Мужской' : 'Женский'}</span>
                    {selectedPatient.policyOms && <><span>·</span><span>Полис: <span className="font-mono-med">{selectedPatient.policyOms}</span></span></>}
                    {selectedPatient.snils && <><span>·</span><span>СНИЛС: <span className="font-mono-med">{selectedPatient.snils}</span></span></>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {selectedPatient.bloodGroup && (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${bloodGroupColors[selectedPatient.bloodGroup] || 'bg-gray-100 text-gray-800'}`}>
                      {selectedPatient.bloodGroup}
                    </span>
                  )}
                  {card && <span className="med-badge-active">Карта № {card.cardNumber}</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                <div><p className="text-xs text-muted-foreground">Телефон</p><p className="text-sm font-medium">{selectedPatient.phone || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Адрес</p><p className="text-sm font-medium truncate">{selectedPatient.address || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Аллергии</p><p className="text-sm font-medium text-red-600">{selectedPatient.allergies || 'Нет'}</p></div>
              </div>
              {selectedPatient.chronicDiseases && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Хронические заболевания</p>
                  <p className="text-sm">{selectedPatient.chronicDiseases}</p>
                </div>
              )}
            </div>

            {/* Examinations */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                История осмотров ({patientExams.length})
              </h3>
              {patientExams.length === 0 ? (
                <div className="bg-white rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
                  Осмотры пока не проводились
                </div>
              ) : (
                <div className="space-y-3">
                  {[...patientExams].reverse().map(exam => {
                    const doctor = staff.find(s => s.id === exam.doctorId);
                    return (
                      <div key={exam.id} className="bg-white rounded-lg border border-border p-4 animate-fade-in">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-med text-xs font-medium text-muted-foreground">{exam.date}</span>
                              {exam.time && <span className="font-mono-med text-xs text-muted-foreground">{exam.time}</span>}
                              <span className="med-badge-active">{exam.type}</span>
                            </div>
                            <div className="font-semibold mt-1">{exam.diagnosis}</div>
                            {exam.icdCode && <span className="text-xs text-muted-foreground">МКБ-10: {exam.icdCode}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {doctor ? `${doctor.lastName} ${doctor.firstName}` : '—'}
                          </div>
                        </div>
                        {exam.complaints && <div className="text-sm text-muted-foreground mb-1"><span className="font-medium text-foreground">Жалобы:</span> {exam.complaints}</div>}
                        {exam.prescriptions && <div className="text-sm text-muted-foreground mb-1"><span className="font-medium text-foreground">Назначения:</span> {exam.prescriptions}</div>}
                        {exam.recommendations && <div className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Рекомендации:</span> {exam.recommendations}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
