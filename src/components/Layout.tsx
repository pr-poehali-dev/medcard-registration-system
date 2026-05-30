import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import Icon from '@/components/ui/icon';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'patients', label: 'Пациенты', icon: 'Users' },
  { id: 'staff', label: 'Сотрудники', icon: 'Stethoscope' },
  { id: 'examinations', label: 'Осмотры', icon: 'ClipboardList' },
  { id: 'medcards', label: 'Медицинские карты', icon: 'BookOpen' },
  { id: 'sickleaves', label: 'Больничные листы', icon: 'FileMinus' },
  { id: 'certificates', label: 'Справки и выписки', icon: 'FileText' },
  { id: 'print', label: 'Печать документов', icon: 'Printer' },
  { id: 'users', label: 'Учётные записи', icon: 'ShieldCheck' },
];

const roleLabel: Record<string, string> = {
  admin: 'Администратор',
  doctor: 'Врач',
  nurse: 'Медсестра',
  registrar: 'Регистратор',
};

export default function Layout({ children, activeSection, onNavigate }: LayoutProps) {
  const { currentUser, logout } = useMedStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? '64px' : '240px',
          background: 'hsl(213, 55%, 16%)',
          borderRight: '1px solid hsl(213, 40%, 22%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'hsl(213, 40%, 22%)' }}>
          <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'hsl(196, 80%, 42%)' }}>
            <Icon name="Cross" size={16} className="text-white" fallback="Plus" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <div className="text-white text-sm font-bold leading-tight">МедЦентр</div>
              <div className="text-xs" style={{ color: 'hsl(213, 20%, 60%)' }}>МИС v1.0</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 text-left ${
                activeSection === item.id
                  ? 'text-white'
                  : 'hover:text-white'
              }`}
              style={{
                color: activeSection === item.id ? 'white' : 'hsl(213, 20%, 65%)',
                background: activeSection === item.id ? 'hsl(196, 80%, 38%)' : 'transparent',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} size={18} className="flex-shrink-0" fallback="Circle" />
              {!collapsed && <span className="truncate animate-fade-in">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: 'hsl(213, 40%, 22%)' }}>
          {!collapsed && currentUser && (
            <div className="mb-2 px-2 animate-fade-in">
              <div className="text-xs font-medium text-white truncate">{currentUser.name}</div>
              <div className="text-xs" style={{ color: 'hsl(213, 20%, 55%)' }}>{roleLabel[currentUser.role]}</div>
            </div>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex-1 flex items-center justify-center p-2 rounded-md transition-colors hover:bg-white/10"
              style={{ color: 'hsl(213, 20%, 60%)' }}
              title={collapsed ? 'Развернуть' : 'Свернуть'}
            >
              <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} fallback="ChevronLeft" />
            </button>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center p-2 rounded-md transition-colors hover:bg-red-500/20 hover:text-red-300"
              style={{ color: 'hsl(213, 20%, 60%)' }}
              title="Выйти"
            >
              <Icon name="LogOut" size={16} fallback="LogOut" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {navItems.find(n => n.id === activeSection)?.label || 'МедЦентр'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Система работает</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}