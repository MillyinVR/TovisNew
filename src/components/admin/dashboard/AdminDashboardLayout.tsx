import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Menu, X } from 'lucide-react';
import { ProfessionalManagement } from '../professionals/ProfessionalManagement';
import { ServiceManagement } from '../services/ServiceManagement';
import { SupportDashboard } from '../support/SupportDashboard';
import { FinanceDashboard } from '../finance/FinanceDashboard';
import { MarketingDashboard } from '../marketing/MarketingDashboard';
import { SystemSettings } from '../settings/SystemSettings';
import { AdminOverview } from './AdminOverview';
import { useAuth } from '../../../contexts/AuthContext';
import { BookingsManagement } from '../BookingsManagement';

export type DashboardTab = 
  | 'overview'
  | 'professionals'
  | 'services'
  | 'support'
  | 'finance'
  | 'marketing'
  | 'settings'
  | 'bookings';

interface AdminSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export const AdminDashboardLayout = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'professionals':
        return <ProfessionalManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'support':
        return <SupportDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'settings':
        return <SystemSettings />;
      case 'bookings':
        return <BookingsManagement />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
      
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 z-40 lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col z-50 w-64 bg-white transform transition-transform duration-300 lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={(tab: DashboardTab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }} 
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={(tab: DashboardTab) => setActiveTab(tab)} 
        />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-4">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
