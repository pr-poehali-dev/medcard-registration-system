import { useState } from 'react';
import { useMedStore } from '@/store/medStore';
import Icon from '@/components/ui/icon';
import LoginPage from '@/components/LoginPage';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import PatientsSection from '@/components/PatientsSection';
import StaffSection from '@/components/StaffSection';
import ExaminationsSection from '@/components/ExaminationsSection';
import MedCardsSection from '@/components/MedCardsSection';
import SickLeavesSection from '@/components/SickLeavesSection';
import CertificatesSection from '@/components/CertificatesSection';
import PrintSection from '@/components/PrintSection';
import UsersSection from '@/components/UsersSection';

export default function Index() {
  const { currentUser, loading } = useMedStore();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!currentUser) return <LoginPage />;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'hsl(213, 55%, 14%)' }}>
      <Icon name="Loader2" size={36} className="text-white animate-spin" fallback="Loader" />
      <p className="text-white text-sm font-medium">Загрузка данных системы...</p>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard onNavigate={setActiveSection} />;
      case 'patients': return <PatientsSection />;
      case 'staff': return <StaffSection />;
      case 'examinations': return <ExaminationsSection />;
      case 'medcards': return <MedCardsSection />;
      case 'sickleaves': return <SickLeavesSection />;
      case 'certificates': return <CertificatesSection />;
      case 'print': return <PrintSection />;
      case 'users': return <UsersSection />;
      default: return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <Layout activeSection={activeSection} onNavigate={setActiveSection}>
      {renderSection()}
    </Layout>
  );
}