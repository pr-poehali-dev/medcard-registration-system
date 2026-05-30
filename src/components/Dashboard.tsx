import { useMedStore } from '@/store/medStore';
import Icon from '@/components/ui/icon';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon, color, bg }: StatCardProps) {
  return (
    <div className="med-stat-card animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <Icon name={icon} size={18} style={{ color }} fallback="Circle" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground font-mono-med">{value}</div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { patients, staff, examinations, sickLeaves, certificates, currentUser } = useMedStore();

  const today = new Date().toISOString().split('T')[0];
  const todayExams = examinations.filter(e => e.date === today);
  const openSickLeaves = sickLeaves.filter(s => s.status === 'open');

  const recentExams = [...examinations].reverse().slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="bg-white rounded-xl border border-border p-6 flex items-center justify-between overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: 'linear-gradient(135deg, hsl(213,70%,28%) 0%, hsl(196,80%,42%) 100%)' }}
        />
        <div className="relative">
          <h1 className="text-xl font-bold text-foreground">
            Добро пожаловать, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Сегодня {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="relative hidden md:block">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'hsl(213, 70%, 28%)' }}>
            <Icon name="Stethoscope" size={28} className="text-white" fallback="Plus" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Пациентов" value={patients.length} icon="Users" color="hsl(213,70%,28%)" bg="hsl(213,70%,95%)" />
        <StatCard label="Сотрудников" value={staff.length} icon="Stethoscope" color="hsl(196,80%,42%)" bg="hsl(196,80%,92%)" />
        <StatCard label="Осмотров сегодня" value={todayExams.length} icon="ClipboardList" color="hsl(152,55%,40%)" bg="hsl(152,55%,92%)" />
        <StatCard label="Открытых б/л" value={openSickLeaves.length} icon="FileMinus" color="hsl(36,90%,50%)" bg="hsl(36,90%,92%)" />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Новый пациент', icon: 'UserPlus', section: 'patients', color: 'hsl(213,70%,28%)' },
            { label: 'Новый осмотр', icon: 'Plus', section: 'examinations', color: 'hsl(196,80%,42%)' },
            { label: 'Больничный лист', icon: 'FileMinus', section: 'sickleaves', color: 'hsl(36,90%,50%)' },
            { label: 'Справка', icon: 'FileText', section: 'certificates', color: 'hsl(152,55%,40%)' },
          ].map(action => (
            <button
              key={action.section}
              onClick={() => onNavigate(action.section)}
              className="bg-white border border-border rounded-lg p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all hover:-translate-y-0.5 text-center group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ background: `${action.color}15` }}>
                <Icon name={action.icon} size={20} style={{ color: action.color }} fallback="Plus" />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent examinations */}
      {recentExams.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Последние осмотры</h3>
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="med-table-header">
                  <th className="px-4 py-3 text-left font-semibold">Дата</th>
                  <th className="px-4 py-3 text-left font-semibold">Пациент</th>
                  <th className="px-4 py-3 text-left font-semibold">Диагноз</th>
                  <th className="px-4 py-3 text-left font-semibold">Тип</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((e, i) => {
                  const patient = useMedStore.getState().patients.find(p => p.id === e.patientId);
                  return (
                    <tr key={e.id} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-muted/30'}`}>
                      <td className="px-4 py-3 font-mono-med text-xs text-muted-foreground">{e.date}</td>
                      <td className="px-4 py-3 font-medium">{patient ? `${patient.lastName} ${patient.firstName}` : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{e.diagnosis || '—'}</td>
                      <td className="px-4 py-3"><span className="med-badge-active">{e.type}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentExams.length === 0 && (
        <div className="bg-white rounded-lg border border-border p-12 flex flex-col items-center gap-3 text-center">
          <Icon name="ClipboardList" size={40} className="text-muted-foreground/40" fallback="FileText" />
          <p className="text-sm font-medium text-muted-foreground">Осмотры ещё не добавлены</p>
          <p className="text-xs text-muted-foreground">Начните с регистрации пациентов и добавления осмотров</p>
        </div>
      )}
    </div>
  );
}
